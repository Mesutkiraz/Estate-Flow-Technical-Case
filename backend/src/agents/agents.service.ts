import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from './agent.schema';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private readonly agentModel: Model<AgentDocument>,
  ) {}

  async findAll(): Promise<AgentDocument[]> {
    return this.agentModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<AgentDocument> {
    const agent = await this.agentModel.findById(id).exec();
    if (!agent) {
      throw new NotFoundException(`Agent #${id} not found`);
    }
    return agent;
  }

  async create(dto: CreateAgentDto): Promise<AgentDocument> {
    try {
      const agent = new this.agentModel(dto);
      return await agent.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateAgentDto): Promise<AgentDocument> {
    const agent = await this.agentModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .exec();
    if (!agent) {
      throw new NotFoundException(`Agent #${id} not found`);
    }
    return agent;
  }

  async remove(id: string): Promise<void> {
    const result = await this.agentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Agent #${id} not found`);
    }
  }
}
