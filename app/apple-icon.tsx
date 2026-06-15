import { ImageResponse } from "next/og";

// Apple touch icon — rendered to PNG at build time.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141210",
          color: "#F4F0E9",
          fontSize: 104,
          fontWeight: 700,
          letterSpacing: -6,
        }}
      >
        <span style={{ display: "flex" }}>
          SM<span style={{ color: "#A8765A" }}>.</span>
        </span>
      </div>
    ),
    { ...size }
  );
}
