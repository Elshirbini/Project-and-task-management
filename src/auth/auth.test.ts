import request from "supertest";
import app from "../app";
import * as userRepository from "../user/user.repository";
import bcrypt from "bcrypt";

jest.mock("../user/user.repository");
jest.mock("../project/project.repository");
jest.mock("../task/task.repository");

const mockedUserRepository = userRepository as jest.Mocked<
  typeof userRepository
>;

describe("Auth API Endpoints", () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
    process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
    process.env.ACCESS_TOKEN_EXPIRE = "15m";
    process.env.REFRESH_TOKEN_EXPIRE = "7d";
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("POST /api/v1/auth/signup", () => {
    it("should create a new account successfully", async () => {
      mockedUserRepository.findUserByEmail.mockResolvedValue(null);
      mockedUserRepository.createUser.mockResolvedValue({} as any);

      const res = await request(app).post("/api/v1/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Account created successfully");
      expect(mockedUserRepository.createUser).toHaveBeenCalled();
    });

    it("should return error if email already exists", async () => {
      mockedUserRepository.findUserByEmail.mockResolvedValue({ id: 1 } as any);

      const res = await request(app).post("/api/v1/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("This email is already exist");
    });

    it("should validate inputs", async () => {
      const res = await request(app).post("/api/v1/auth/signup").send({
        email: "notanemail",
        password: "short",
      });

      expect(res.status).toBe(400); // Express validator typically returns 400
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login successfully with correct credentials", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      mockedUserRepository.findUserByEmail.mockResolvedValue({
        user_id: "user123",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        password: hashedPassword,
      } as any);

      const res = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Login successfully");
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data).toHaveProperty("refreshToken");
    });

    it("should return error for invalid password", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      mockedUserRepository.findUserByEmail.mockResolvedValue({
        user_id: "user123",
        password: hashedPassword,
      } as any);

      const res = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Password Wrong");
    });
  });

  describe("GET /api/v1/auth/profile", () => {
    it("should get profile with valid token", async () => {
      const jwt = require("jsonwebtoken");
      const token = jwt.sign(
        { id: "user123", role: "user" },
        process.env.ACCESS_TOKEN_SECRET,
      );

      mockedUserRepository.findUserById.mockResolvedValue({
        user_id: "user123",
        name: "Test User",
        email: "test@example.com",
      } as any);

      const res = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Test User");
    });

    it("should return unauthorized without token", async () => {
      const res = await request(app).get("/api/v1/auth/profile");
      expect(res.status).toBe(401); // Without token, auth middleware returns 401
    });
  });

  describe("POST /api/v1/auth/refresh-token", () => {
    it("should return a new access token with valid refresh token", async () => {
      const jwt = require("jsonwebtoken");
      const refreshToken = jwt.sign(
        { id: "user123" },
        process.env.REFRESH_TOKEN_SECRET,
      );

      mockedUserRepository.findUserById.mockResolvedValue({
        user_id: "user123",
        role: "user",
      } as any);

      const res = await request(app)
        .post("/api/v1/auth/refresh-token")
        .set("Authorization", `Bearer ${refreshToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("accessToken");
    });
  });
});
