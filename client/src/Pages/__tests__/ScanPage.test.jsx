import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ScanPage from "../ScanPage.jsx";

const navigateMock = vi.fn();
const openCameraMock = vi.fn();
const closeCameraMock = vi.fn();
const capturePhotoMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../hooks/useCameraCapture.js", () => ({
  useCameraCapture: () => ({
    stream: null,
    isOpen: false,
    error: "",
    loading: false,
    openCamera: openCameraMock,
    closeCamera: closeCameraMock,
    capturePhoto: capturePhotoMock,
  }),
}));

describe("ScanPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    openCameraMock.mockReset();
    closeCameraMock.mockReset();
    capturePhotoMock.mockReset();

    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:preview"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("calls openCamera when camera button is clicked", () => {
    render(
      <MemoryRouter>
        <ScanPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /צלם קבלה/i }));
    expect(openCameraMock).toHaveBeenCalledTimes(1);
  });

  it("enables scan button after selecting a file", async () => {
    render(
      <MemoryRouter>
        <ScanPage />
      </MemoryRouter>,
    );

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["receipt"], "receipt.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "סרוק קבלה" })).toBeEnabled();
    });
  });
});
