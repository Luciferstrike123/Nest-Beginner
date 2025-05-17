import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SongModule } from './song/song.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AnswerModule } from './answer/answer.module';
import { AuthModule } from './auth/auth.module';
import { SpotifyModule } from './spotify/spotify.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        console.log(__dirname);
        return {
          type: 'postgres',
          url: dbUrl,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          ssl: {
            rejectUnauthorized: false,
          },
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    UserModule,
    SongModule,
    FeedbackModule,
    AnswerModule,
    SpotifyModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
