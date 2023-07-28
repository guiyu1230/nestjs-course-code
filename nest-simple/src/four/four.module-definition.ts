import { ConfigurableModuleBuilder } from "@nestjs/common";

export interface FourModuleOptions {
    aaa: number;
    bbb: string;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<FourModuleOptions>().build();