import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsModule } from './agents/agents.module';
import { CommissionModule } from './commission/commission.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGO_URI') ||
          'mongodb://127.0.0.1:27017/estate',
      }),
    }),
    AgentsModule,
    CommissionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}