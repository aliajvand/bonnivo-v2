from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.wallet import Wallet, WalletTransaction, WalletWithdrawalRequest, TransactionType, WithdrawalStatus

router = APIRouter(prefix="/wallet", tags=["Wallet & Balance"])


class WalletTransactionResponse(BaseModel):
    id: str
    amount_tomans: int
    transaction_type: TransactionType
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None
    description: str
    created_at: datetime


class WalletResponse(BaseModel):
    id: str
    balance_tomans: int
    transactions: List[WalletTransactionResponse]


class WithdrawalRequestPayload(BaseModel):
    amount_tomans: int = Field(..., gt=10000, description="حداقل مبلغ برداشت ۱۰,۰۰۰ تومان است")
    card_number: str = Field(..., min_length=16, max_length=19)
    sheba_number: Optional[str] = None


class WithdrawalRequestResponse(BaseModel):
    id: str
    amount_tomans: int
    card_number: str
    sheba_number: Optional[str]
    status: WithdrawalStatus
    admin_note: Optional[str]
    created_at: datetime


class WithdrawalProcessPayload(BaseModel):
    status: WithdrawalStatus
    admin_note: Optional[str] = None


async def get_or_create_wallet(user_id: str, db: AsyncSession) -> Wallet:
    stmt = (
        select(Wallet)
        .options(selectinload(Wallet.transactions))
        .where(Wallet.user_id == user_id)
    )
    res = await db.execute(stmt)
    wallet = res.scalar_one_or_none()
    if not wallet:
        wallet = Wallet(user_id=user_id, balance_tomans=0)
        db.add(wallet)
        await db.commit()
        await db.refresh(wallet)
        # re-query with transactions
        stmt = (
            select(Wallet)
            .options(selectinload(Wallet.transactions))
            .where(Wallet.id == wallet.id)
        )
        res = await db.execute(stmt)
        wallet = res.scalar_one()
    return wallet


@router.get("/me", response_model=WalletResponse)
async def get_user_wallet(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    wallet = await get_or_create_wallet(current_user.id, db)
    return WalletResponse(
        id=wallet.id,
        balance_tomans=wallet.balance_tomans,
        transactions=[
            WalletTransactionResponse(
                id=tx.id,
                amount_tomans=tx.amount_tomans,
                transaction_type=tx.transaction_type,
                reference_id=tx.reference_id,
                reference_type=tx.reference_type,
                description=tx.description,
                created_at=tx.created_at,
            )
            for tx in wallet.transactions
        ],
    )


@router.post("/withdraw", response_model=WithdrawalRequestResponse)
async def request_wallet_withdrawal(
    payload: WithdrawalRequestPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    wallet = await get_or_create_wallet(current_user.id, db)

    if wallet.balance_tomans < payload.amount_tomans:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"موجودی کیف پول ({wallet.balance_tomans:,} تومان) کمتر از مبلغ درخواستی ({payload.amount_tomans:,} تومان) است.",
        )

    # Deduct amount from wallet balance and record transaction
    wallet.balance_tomans -= payload.amount_tomans

    withdrawal = WalletWithdrawalRequest(
        user_id=current_user.id,
        amount_tomans=payload.amount_tomans,
        card_number=payload.card_number,
        sheba_number=payload.sheba_number,
        status=WithdrawalStatus.REQUESTED,
    )
    db.add(withdrawal)
    await db.flush()

    tx = WalletTransaction(
        wallet_id=wallet.id,
        amount_tomans=-payload.amount_tomans,
        transaction_type=TransactionType.WITHDRAWAL,
        reference_id=withdrawal.id,
        reference_type="WITHDRAWAL",
        description=f"درخواست تسویه و واریز به کارت {payload.card_number[-4:]}",
    )
    db.add(tx)
    await db.commit()
    await db.refresh(withdrawal)

    return WithdrawalRequestResponse(
        id=withdrawal.id,
        amount_tomans=withdrawal.amount_tomans,
        card_number=withdrawal.card_number,
        sheba_number=withdrawal.sheba_number,
        status=withdrawal.status,
        admin_note=withdrawal.admin_note,
        created_at=withdrawal.created_at,
    )


@router.get("/admin/withdrawals", response_model=List[WithdrawalRequestResponse])
async def list_admin_withdrawals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    stmt = select(WalletWithdrawalRequest).order_by(WalletWithdrawalRequest.created_at.desc())
    res = await db.execute(stmt)
    withdrawals = res.scalars().all()
    return [
        WithdrawalRequestResponse(
            id=w.id,
            amount_tomans=w.amount_tomans,
            card_number=w.card_number,
            sheba_number=w.sheba_number,
            status=w.status,
            admin_note=w.admin_note,
            created_at=w.created_at,
        )
        for w in withdrawals
    ]


@router.post("/admin/withdrawals/{withdrawal_id}/process", response_model=WithdrawalRequestResponse)
async def process_admin_withdrawal(
    withdrawal_id: str,
    payload: WithdrawalProcessPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    stmt = select(WalletWithdrawalRequest).where(WalletWithdrawalRequest.id == withdrawal_id)
    res = await db.execute(stmt)
    withdrawal = res.scalar_one_or_none()
    if not withdrawal:
        raise HTTPException(status_code=404, detail="درخواست برداشت یافت نشد")

    if withdrawal.status in (WithdrawalStatus.PAID, WithdrawalStatus.REJECTED):
        raise HTTPException(status_code=400, detail="این درخواست قبلاً نهایی شده است.")

    old_status = withdrawal.status
    withdrawal.status = payload.status
    withdrawal.admin_note = payload.admin_note

    # If rejected, refund money back to wallet balance
    if payload.status == WithdrawalStatus.REJECTED and old_status != WithdrawalStatus.REJECTED:
        wallet = await get_or_create_wallet(withdrawal.user_id, db)
        wallet.balance_tomans += withdrawal.amount_tomans
        tx = WalletTransaction(
            wallet_id=wallet.id,
            amount_tomans=withdrawal.amount_tomans,
            transaction_type=TransactionType.CREDIT_REFUND,
            reference_id=withdrawal.id,
            reference_type="WITHDRAWAL_REFUND",
            description="بازگشت وجه درخواست تسویه رد شده به کیف پول",
        )
        db.add(tx)

    await db.commit()
    await db.refresh(withdrawal)

    return WithdrawalRequestResponse(
        id=withdrawal.id,
        amount_tomans=withdrawal.amount_tomans,
        card_number=withdrawal.card_number,
        sheba_number=withdrawal.sheba_number,
        status=withdrawal.status,
        admin_note=withdrawal.admin_note,
        created_at=withdrawal.created_at,
    )
