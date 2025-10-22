export type UserRoles = {
  ANON: "anon";
  ADMIN: "admin";
  USER: "user";
  MANAGER: "manager";
};

export type UserRole = UserRoles[keyof UserRoles];
