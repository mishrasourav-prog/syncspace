import { v2 as cloudinary, type ConfigOptions } from "cloudinary";

import ApiError from "../utils/ApiError";

const DEFAULT_AVATAR_FOLDER = "syncspace/avatars";

const DEFAULT_WORKSPACE_AVATAR_FOLDER = "syncspace/workspaces";

let isConfigured = false;

const getRequiredEnvironmentValue = (
  key: "CLOUDINARY_CLOUD_NAME" | "CLOUDINARY_API_KEY" | "CLOUDINARY_API_SECRET",
): string => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new ApiError(500, `${key} is not configured.`);
  }

  return value;
};

export const getCloudinaryAvatarFolder = (): string => {
  const configuredFolder = process.env.CLOUDINARY_AVATAR_FOLDER?.trim();

  return configuredFolder || DEFAULT_AVATAR_FOLDER;
};

export const getCloudinaryWorkspaceAvatarFolder = (): string => {
  const configuredFolder =
    process.env.CLOUDINARY_WORKSPACE_AVATAR_FOLDER?.trim();

  return configuredFolder || DEFAULT_WORKSPACE_AVATAR_FOLDER;
};

export const configureCloudinary = (): typeof cloudinary => {
  if (isConfigured) {
    return cloudinary;
  }

  const options: ConfigOptions = {
    cloud_name: getRequiredEnvironmentValue("CLOUDINARY_CLOUD_NAME"),

    api_key: getRequiredEnvironmentValue("CLOUDINARY_API_KEY"),

    api_secret: getRequiredEnvironmentValue("CLOUDINARY_API_SECRET"),

    secure: true,
  };

  cloudinary.config(options);

  isConfigured = true;

  return cloudinary;
};

export const getCloudinary = (): typeof cloudinary => configureCloudinary();

export default cloudinary;
