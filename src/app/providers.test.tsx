import { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { Providers } from "./providers";

jest.mock("@/components/Header", () => () => <div>Header</div>);
jest.mock("@/components/Footer", () => () => <div>Footer</div>);

jest.mock("@/context/MockProvider", () => ({
  MockProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/context/AuthProvider", () => ({
  AuthProvider: () => <div>Auth</div>,
}));

jest.mock("@/components/ErrorBoundary", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/context/ThemeContext", () => ({
  useTheme: () => ({ theme: "light" }),
}));

describe("tests for providers", () => {
  test("renders header, footer and children", () => {
    render(
      <Providers>
        <div>Child component</div>
      </Providers>
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(screen.getByText("Child component")).toBeInTheDocument();
  });
});
