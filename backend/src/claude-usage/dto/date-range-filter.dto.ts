import { IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class DateRangeFilterDto {
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}
