import {
  AuthTokenResponse,
  CanonicalProduct,
  CareTask,
  HealthCheckResponse,
  Pet,
  User,
} from "./types.js";

export interface BonyoClientOptions {
  baseUrl?: string;
  token?: string;
}

export class BonyoApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(options: BonyoClientOptions = {}) {
    this.baseUrl = options.baseUrl || "http://localhost:8000";
    this.token = options.token;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error ${response.status}: ${errorBody}`);
    }

    return response.json() as Promise<T>;
  }

  // Health
  async getHealth(): Promise<HealthCheckResponse> {
    return this.fetch<HealthCheckResponse>("/health");
  }

  // Auth
  async requestOtp(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    return this.fetch("/api/v1/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<AuthTokenResponse> {
    return this.fetch<AuthTokenResponse>("/api/v1/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, code }),
    });
  }

  // Pets
  async getPets(): Promise<Pet[]> {
    return this.fetch<Pet[]>("/api/v1/pets");
  }

  async createPet(data: Partial<Pet>): Promise<Pet> {
    return this.fetch<Pet>("/api/v1/pets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPet(id: string): Promise<Pet> {
    return this.fetch<Pet>(`/api/v1/pets/${id}`);
  }

  async updatePet(id: string, data: Partial<Pet>): Promise<Pet> {
    return this.fetch<Pet>(`/api/v1/pets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePet(id: string): Promise<{ success: boolean }> {
    return this.fetch(`/api/v1/pets/${id}`, {
      method: "DELETE",
    });
  }

  // Tasks
  async getCareTasks(petId: string): Promise<CareTask[]> {
    return this.fetch<CareTask[]>(`/api/v1/care/tasks?petId=${petId}`);
  }

  async completeCareTask(taskId: string): Promise<CareTask> {
    return this.fetch<CareTask>(`/api/v1/care/tasks/${taskId}/complete`, {
      method: "POST",
    });
  }

  // Catalog
  async getProducts(params: { species?: string; category?: string } = {}): Promise<CanonicalProduct[]> {
    const query = new URLSearchParams();
    if (params.species) query.set("species", params.species);
    if (params.category) query.set("category", params.category);
    return this.fetch<CanonicalProduct[]>(`/api/v1/products?${query.toString()}`);
  }

  async getProductBySlug(slug: string): Promise<CanonicalProduct> {
    return this.fetch<CanonicalProduct>(`/api/v1/products/${slug}`);
  }
}
