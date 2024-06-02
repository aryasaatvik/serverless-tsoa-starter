import { Controller, Get, Route, SuccessResponse } from "tsoa";

@Route("healthcheck")
export class HealthCheckController extends Controller {
  @SuccessResponse("200", "OK")
  @Get()
  public async getHealthCheck(): Promise<string> {
    this.setStatus(200);
    return "API is healthy and running";
  };
}