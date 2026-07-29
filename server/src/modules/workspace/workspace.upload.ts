/*
|--------------------------------------------------------------------------
| Shared Avatar Upload Validation
|--------------------------------------------------------------------------
|
| Workspace avatars use the same trusted upload contract as profile avatars:
| one in-memory JPEG, PNG, or WebP file, maximum 5 MB, with file-signature
| verification after Multer's declared MIME-type check.
|
*/

export {
  uploadAvatar as uploadWorkspaceAvatar,
} from "../users/user.upload";
