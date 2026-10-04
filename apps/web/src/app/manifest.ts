import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "بونیو | اکوسیستم هوشمند زندگی و مراقبت پت",
    short_name: "بونیو",
    description: "شناسنامه دیجیتال، پاسپورت اضطراری QR و فروشگاه متصل به پت",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#0F766E",
    dir: "rtl",
    lang: "fa",
    icons: [
      {
        src: "/icons/bonnivo-logo-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
