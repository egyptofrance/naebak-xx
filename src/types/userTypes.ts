export type UserRoles = {
  ANON: "anon";
  ADMIN: "admin";
  USER: "user";
  MANAGER: "manager";
  DEPUTY: "deputy";
};

export type UserRole = UserRoles[keyof UserRoles];
