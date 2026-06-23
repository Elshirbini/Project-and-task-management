import request from "supertest";
import app from "../app";
import * as projectRepository from "./project.repository";
import * as userRepository from "../user/user.repository";

jest.mock("./project.repository");
jest.mock("../user/user.repository");
jest.mock("../task/task.repository");
const mockedProjectRepo = projectRepository as jest.Mocked<
  typeof projectRepository
>;
const mockedUserRepository = userRepository as jest.Mocked<
  typeof userRepository
>;

describe("Project API Endpoints", () => {
  let token: string;

  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
    const jwt = require("jsonwebtoken");
    token = jwt.sign(
      { id: "user123", role: "user" },
      process.env.ACCESS_TOKEN_SECRET,
    );
  });

  beforeEach(() => {
    mockedUserRepository.findUserById.mockResolvedValue({
      user_id: "user123",
      role: "user",
    } as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("POST /api/v1/project", () => {
    it("should create a new project successfully", async () => {
      mockedProjectRepo.createProject.mockResolvedValue({
        project_id: "proj123",
        title: "New Project",
        description: "Desc",
        status: "pending",
        user_id: "user123",
      } as any);

      const res = await request(app)
        .post("/api/v1/project")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "New Project",
          description: "Desc",
          status: "pending",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Project created successfully");
      expect(mockedProjectRepo.createProject).toHaveBeenCalled();
    });
  });

  describe("GET /api/v1/project", () => {
    it("should retrieve projects", async () => {
      mockedProjectRepo.findProjectsByUserId.mockResolvedValue({
        rows: [{ project_id: "proj123", title: "P1" }],
        count: 1,
      } as any);

      const res = await request(app)
        .get("/api/v1/project?page=1&limit=10")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      // Controller wraps: success(res, 200, msg, { data: rows, meta: {...} })
      // So res.body = { success, message, data: { data: [...], meta: {...} } }
      expect(res.body.data.data).toBeInstanceOf(Array);
      expect(res.body.data.meta.totalCount).toBe(1);
    });
  });

  describe("GET /api/v1/project/:id", () => {
    it("should retrieve a project by id", async () => {
      mockedProjectRepo.findProjectById.mockResolvedValue({
        project_id: "proj123",
        user_id: "user123",
        title: "P1",
      } as any);

      const res = await request(app)
        .get("/api/v1/project/proj123")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.project_id).toBe("proj123");
    });

    it("should return 404 if project not found or not owned by user", async () => {
      mockedProjectRepo.findProjectById.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/v1/project/proj123")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Project not found");
    });
  });

  describe("PATCH /api/v1/project/:id", () => {
    it("should update a project successfully", async () => {
      const mockProject = {
        project_id: "proj123",
        user_id: "user123",
        title: "P1",
      };

      mockedProjectRepo.findProjectById.mockResolvedValue(mockProject as any);
      mockedProjectRepo.updateProject.mockResolvedValue({
        ...mockProject,
        title: "Updated P1",
      } as any);

      const res = await request(app)
        .patch("/api/v1/project/proj123")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Updated P1",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Project updated successfully");
      expect(res.body.data.title).toBe("Updated P1");
    });
  });

  describe("DELETE /api/v1/project/:id", () => {
    it("should delete a project successfully", async () => {
      mockedProjectRepo.findProjectById.mockResolvedValue({
        project_id: "proj123",
        user_id: "user123",
        title: "P1",
      } as any);
      mockedProjectRepo.deleteProject.mockResolvedValue({} as any);

      const res = await request(app)
        .delete("/api/v1/project/proj123")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Project deleted successfully");
    });
  });
});
