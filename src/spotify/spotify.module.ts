import { HttpModule } from "@nestjs/axios";
import { Global, Module } from "@nestjs/common";
import { SpotifyService } from "./spotify.service";
import { SpotifyController } from "./spotify.controller";

@Global()
@Module({
  imports: [HttpModule], 
  controllers: [SpotifyController],
  providers: [SpotifyService],
  exports: [SpotifyService],
})
export class SpotifyModule {}