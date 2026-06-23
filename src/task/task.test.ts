import request from "supertest";
import app from "../app";
import * as taskRepository from "./task.repository";
import * as projectRepository from "../project/project.repository";
import * as userRepository from "../user/user.repository";

jest.mock("./task.repository");
jest.mock("../project/project.repository");
jest.mock("../user/user.repository");
const mockedTaskRepo = taskRepository as jest.Mocked<typeof taskRepository>;
const mockedProjectRepo = projectRepository as jest.Mocked<
  typeof projectRepository
>;
const mockedUserRepository = userRepository as jest.Mocked<
  typeof userRepository
>;

describe("Task API Endpoints", () => {
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
    // Mock verifyToken's findUserById call
    mockedUserRepository.findUserById.mockResolvedValue({
      user_id: "user123",
      role: "user",
    } as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("POST /api/v1/task/project/:project_id", () => {
    it("should create a new task successfully", async () => {
      mockedProjectRepo.findProjectById.mockResolvedValue({
        project_id: "proj123",
        user_id: "user123",
      } as any);

      mockedTaskRepo.createTask.mockResolvedValue({
        task_id: "task123",
        title: "New Task",
        description: "Desc",
        status: "pending",
      } as any);

      const res = await request(app)
        .post("/api/v1/task/project/proj123")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "New Task",
          description: "Desc", // required by validator
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Task created successfully");
    });

    it("should return 404 if project not found", async () => {
      mockedProjectRepo.findProjectById.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/v1/task/project/proj123")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "New Task",
          description: "Desc", // required by validator to pass validation and reach controller
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Project not found");
    });
  });

  describe("GET /api/v1/task/project/:project_id", () => {
    it("should retrieve tasks for a project", async () => {
      mockedProjectRepo.findProjectById.mockResolvedValue({
        project_id: "proj123",
        user_id: "user123",
      } as any);

      mockedTaskRepo.findTasks.mockResolvedValue({
        rows: [{ task_id: "task123", title: "T1" }],
        count: 1,
      } as any);

      const res = await request(app)
        .get("/api/v1/task/project/proj123?page=1&limit=10")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      // Controller wraps: success(res, 200, msg, { data: rows, meta: {...} })
      // So res.body = { success, message, data: { data: [...], meta: {...} } }
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta.totalCount).toBe(1);
    });
  });

  describe("GET /api/v1/task/:id", () => {
    it("should retrieve a task by id", async () => {
      mockedTaskRepo.findTaskById.mockResolvedValue({
        task_id: "task123",
        user_id: "user123",
        title: "T1",
      } as any);

      const res = await request(app)
        .get("/api/v1/task/task123")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.task_id).toBe("task123");
    });
  });

  describe("PATCH /api/v1/task/:id", () => {
    it("should update a task successfully", async () => {
      const mockTask = {
        task_id: "task123",
        user_id: "user123",
        title: "T1",
      };

      mockedTaskRepo.findTaskById.mockResolvedValue(mockTask as any);
      mockedTaskRepo.updateTask.mockResolvedValue({
        ...mockTask,
        title: "Updated T1",
      } as any);

      const res = await request(app)
        .patch("/api/v1/task/task123")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Updated T1",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Task updated successfully");
      expect(res.body.data.title).toBe("Updated T1");
    });
  });

  describe("DELETE /api/v1/task/:id", () => {
    it("should delete a task successfully", async () => {
      mockedTaskRepo.findTaskById.mockResolvedValue({
        task_id: "task123",
        user_id: "user123",
        title: "T1",
      } as any);
      mockedTaskRepo.deleteTask.mockResolvedValue({} as any);

      const res = await request(app)
        .delete("/api/v1/task/task123")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Task deleted successfully");
    });
  });
});
