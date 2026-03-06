import { authService } from "../../src/services";
import { User } from "@utsukushii/shared/types/auth";
import { userRepository } from "../../src/repositories";
import { comparePasswords } from "../../src/utils/password";
import { signToken } from "../../src/utils/jwt";
import { UnauthorizedError } from "../../src/errors";

jest.mock("../../src/repositories");
jest.mock("../../src/utils/password");
jest.mock("../../src/utils/jwt");

describe("Auth Service", () => {
  const mockUser = {
    _id: "usr_123",
    email: "test@example.com",
    name: "Test User",
    password: "hashed_password",
  };

  const mockToken = "mock_jwt_token";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should return tokens and user on successful login", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValueOnce(mockUser);
      (comparePasswords as jest.Mock).mockResolvedValueOnce(true);
      (signToken as jest.Mock).mockReturnValue(mockToken);

      const result = await authService.login("test@example.com", "password123");

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com",
      );
      expect(comparePasswords).toHaveBeenCalledWith(
        "password123",
        "hashed_password",
      );
      expect(signToken).toHaveBeenCalledTimes(2); // accessToken, refreshToken

      expect(result.user).toEqual({
        id: "usr_123",
        email: "test@example.com",
        name: "Test User",
      });
      expect(result.tokens).toEqual({
        accessToken: mockToken,
        refreshToken: mockToken,
      });
    });

    it("should throw UnauthorizedError on invalid email", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        authService.login("invalid@example.com", "password"),
      ).rejects.toThrow(UnauthorizedError);

      expect(comparePasswords).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedError on invalid password", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValueOnce(mockUser);
      (comparePasswords as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        authService.login("test@example.com", "wrongpassword"),
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
