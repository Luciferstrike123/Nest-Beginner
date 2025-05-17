import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class SpotifyService {
    private accessToken: string | null = null
    private tokenExpiry: number | null = null

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) { }

    async getAccessToken(): Promise<string> {
        const now = Date.now()

        if (this.accessToken && this.tokenExpiry && now < this.tokenExpiry) {
            return this.accessToken
        }

        const clientId = this.configService.get<string>('CLIENT_ID');
        const clientSecret = this.configService.get<string>('CLIENT_SECRET');

        const response = await firstValueFrom(
            this.httpService.post(
                'https://accounts.spotify.com/api/token',
                'grant_type=client_credentials',
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                    },
                }
            )
        );

        const { access_token, expires_in } = response.data

        this.accessToken = access_token
        this.tokenExpiry = now + expires_in * 1000

        return access_token;
    }

    async getFeaturedPlaylists() {
        try {
            const token = await this.getAccessToken()

            const response = await firstValueFrom(
                this.httpService.get('https://api.spotify.com/v1/playlists/31PcHXsGVN9Yl5zDhIDhJj/tracks', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        market: 'VN'
                    }
                })
            )
            return response.data.items.map((item: any) => ({
                id: item.track.id,
                name: item.track.name,
                artist: item.track.artists.map((a: any) => a.name).join(', '),
                album: item.track.album.name,
                image: item.track.album.images?.[0]?.url,
                previewUrl: item.track.preview_url, 
            }));
        } catch (e) {
            console.error('Spotify API error:', e.response?.data || e.message)
            throw new InternalServerErrorException('Failed to fetch playist from spotify')
        }
    }
}