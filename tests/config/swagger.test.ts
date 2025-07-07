import { Application } from "express";
import request from "supertest";
import app from "../../src/index";

describe("Swagger Configuration", () => {
  describe("API Documentation Endpoints", () => {
    it("should serve Swagger JSON at /api-docs.json", async () => {
      const response = await request(app).get("/api-docs.json").expect(200);

      expect(response.headers["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expect(response.body).toBeDefined();
      expect(response.body.openapi).toBeDefined();
      expect(response.body.info).toBeDefined();
      expect(response.body.info.title).toBe("UAE EOSB Calculator API");
      expect(response.body.paths).toBeDefined();
    });

    it("should serve Swagger UI at /api-docs", async () => {
      const response = await request(app).get("/api-docs/").expect(200);

      expect(response.headers["content-type"]).toContain("text/html");
      expect(response.text).toContain("swagger-ui");
    });
  });
});
