import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Plan, PlanDocument } from './entities/plan.entity';
import { DeleteResponse } from 'src/types/reponses';

@Injectable()
export class PlanesService {
  constructor(@InjectModel(Plan.name) private planModel: Model<PlanDocument>) { }

  async createPlan(createPlaneDto: CreatePlanDto): Promise<Plan> {
    const createdPlan = new this.planModel(createPlaneDto);
    return createdPlan.save();
  }

  async findAllPlans(): Promise<Plan[]> {
    const foundPlanes = await this.planModel.find().exec()
    if (!foundPlanes || foundPlanes.length === 0) {
      throw new NotFoundException("No se pudo encontrar ningun plan.");
    }
    return foundPlanes;
  }

  async findPlanById(planId: string): Promise<Plan> {
    if (!Types.ObjectId.isValid(planId)) {
      throw new NotFoundException({
        status: 404,
        message: `No se pudo encontrar el plan del id: ${planId}`,
        error: "Not found"
      });
    }

    const foundPlan = await this.planModel
      .findById(planId)
      .exec();

    if (!foundPlan) {
      throw new NotFoundException(`No se pudo encontrar el plan del id: ${planId}`);
    }
    return foundPlan;
  }

  async findAndUpdateById(
    planId: string,
    updateData: UpdatePlanDto
  ): Promise<Plan> {
    if (!Types.ObjectId.isValid(planId)) {
      throw new NotFoundException(`No se pudo encontrar el plan del id '${planId}' y por ende no se puede actualizar...`);
    }

    const updatedPlan = await this.planModel
      .findByIdAndUpdate(
        planId,
        updateData,
        { new: true }
      )
      .exec();

    if (!updatedPlan) {
      throw new NotFoundException(`No se pudo encontrar el plan del id '${planId}' y por ende no se puede actualizar...`);
    }
    return updatedPlan;
  }

  async removePlanById(planId: string): Promise<Plan> {
    if (!Types.ObjectId.isValid(planId)) {
      throw new NotFoundException(`No se pudo encontrar el plan con id '${planId}' y por ende no se puede eliminar...`);
    }

    const removedPlan = await this.planModel
      .findByIdAndDelete(planId)
      .exec();

    if (!removedPlan) {
      throw new NotFoundException(`No se pudo encontrar el plan con id '${planId}' y por ende no se puede eliminar...`);
    }
    return removedPlan;
  }

  async removeAllPlans(): Promise<DeleteResponse> {
    const { deletedCount } = await this.planModel.deleteMany().exec();
    if (deletedCount === 0) {
      throw new NotFoundException("No se pudo encontrar ningun plan para eliminar");
    }
    return { deletedCount };
  }

  async removeManyPlansById(planIds: string[]): Promise<DeleteResponse> {
    console.log(planIds)
    if (!planIds || planIds.length === 0) {
      throw new BadRequestException("Debe proporcionar al menos un ID para eliminar.");
    }

    const { deletedCount } = await this.planModel
      .deleteMany({
        _id: {
          $in: planIds
        }
      })
      .exec();
    
    if (deletedCount === 0) {
      throw new NotFoundException("No se pudo encontrar ningun plan para eliminar");
    }
    return { deletedCount };
  }
}
