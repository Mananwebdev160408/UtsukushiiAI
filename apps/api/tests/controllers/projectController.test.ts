import { Request, Response, NextFunction } from "express";
import { projectService } from "../../src/services";
import * as projectController from "../../src/controllers/projectController";
import { HTTP_STATUS } from "@utsukushii/shared/src/utils/constants";
import { User } from "@utsukushii/shared/src/types/auth";

jest.mock("../../src/services");

describe("Project Controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  const mockUser: User = {
    id: "usr_123",
    email: "test@example.com",
    name: "Test User",
  };

  beforeEach(() => {
    mockReq = {
      user: mockUser,
      params: {},
      body: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("getProjects", () => {
    it("should return projects for the user", async () => {
      const mockProjects = [{ id: "prj_1", title: "Test Project" }];
      (projectService.getProjectsByUserId as jest.Mock).mockResolvedValueOnce({
        data: mockProjects,
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
      });

      await projectController.getProjects(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(projectService.getProjectsByUserId).toHaveBeenCalledWith(
        mockUser.id,
        1,
        20, // default limit
      );
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "success", data: mockProjects }),
      );
    });

    it("should pass errors to next middleware", async () => {
      const error = new Error("Database error");
      (projectService.getProjectsByUserId as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await projectController.getProjects(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("createProject", () => {
    it("should create a new project", async () => {
      mockReq.body = { title: "New Manga", type: "manga" };
      const newProject = {
        id: "prj_2",
        title: "New Manga",
        userId: mockUser.id,
      };

      (projectService.createProject as jest.Mock).mockResolvedValueOnce(
        newProject,
      );

      await projectController.createProject(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(projectService.createProject).toHaveBeenCalledWith({
        title: "New Manga",
        type: "manga",
        userId: mockUser.id,
      });
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        data: newProject,
      });
    });
  });
});
