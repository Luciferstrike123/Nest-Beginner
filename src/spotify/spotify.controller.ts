import { Controller, Get } from "@nestjs/common";
import { SpotifyService } from "./spotify.service";

@Controller('spotify')
export class SpotifyController{
    constructor(private readonly spotifyService: SpotifyService) {}

    @Get('trending')
    async getTrendingPlaylists() {
        const res = await this.spotifyService.getFeaturedPlaylists()

        return res
    }
}