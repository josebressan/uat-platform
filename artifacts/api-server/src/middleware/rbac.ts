import type { Request, Response, NextFunction } from "express";

export type Role = "Admin" | "PMO" | "QA_Lead" | "BA" | "PO" | "Tester";

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  Admin: ["*"],
  PMO: ["releases:*", "dashboard:*", "reports:*", "approvals:read", "test-cycles:read", "test-plans:read", "test-cases:read", "test-executions:read", "defects:read", "users:read"],
  QA_Lead: ["test-plans:*", "test-cycles:*", "test-cases:*", "test-executions:*", "defects:*", "reports:*", "dashboard:*", "releases:read", "approvals:read", "users:read"],
  BA: ["test-cases:*", "test-plans:read", "test-cycles:read", "test-executions:read", "defects:read", "releases:read", "dashboard:*", "approvals:read", "users:read"],
  PO: ["approvals:*", "releases:read", "test-cycles:read", "test-plans:read", "test-cases:read", "test-executions:read", "defects:read", "dashboard:*", "reports:*", "users:read"],
  Tester: ["test-executions:*", "defects:create", "defects:read", "test-cases:read", "test-plans:read", "test-cycles:read", "releases:read", "dashboard:*", "users:read"],
};

function hasPermission(role: Role, resource: string, action: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes("*")) return true;
  if (perms.includes(`${resource}:*`)) return true;
  if (perms.includes(`${resource}:${action}`)) return true;
  return false;
}

function methodToAction(method: string): string {
  switch (method.toUpperCase()) {
    case "GET": return "read";
    case "POST": return "create";
    case "PUT":
    case "PATCH": return "update";
    case "DELETE": return "delete";
    default: return "read";
  }
}

function pathToResource(path: string): string {
  const segment = path.split("/").filter(Boolean)[0] || "";
  const resourceMap: Record<string, string> = {
    "users": "users",
    "releases": "releases",
    "test-cycles": "test-cycles",
    "test-plans": "test-plans",
    "test-cases": "test-cases",
    "test-executions": "test-executions",
    "defects": "defects",
    "approvals": "approvals",
    "dashboard": "dashboard",
    "reports": "reports",
    "health": "health",
    "seed": "seed",
  };
  return resourceMap[segment] || segment;
}

export function rbacMiddleware(req: Request, res: Response, next: NextFunction): void {
  const resource = pathToResource(req.path);

  if (resource === "health") {
    next();
    return;
  }

  const userRole = req.headers["x-user-role"] as Role | undefined;
  const userId = req.headers["x-user-id"] as string | undefined;

  if (!userRole || !userId) {
    if (process.env.NODE_ENV === "development") {
      Object.assign(req, { currentUserId: 1, currentUserRole: "Admin" satisfies Role });
      next();
      return;
    }
    res.status(401).json({ error: "Authentication required. Provide x-user-id and x-user-role headers." });
    return;
  }

  const validRoles: Role[] = ["Admin", "PMO", "QA_Lead", "BA", "PO", "Tester"];
  if (!validRoles.includes(userRole)) {
    res.status(403).json({ error: `Invalid role: ${userRole}` });
    return;
  }

  const action = methodToAction(req.method);
  if (!hasPermission(userRole, resource, action)) {
    res.status(403).json({ error: `Role '${userRole}' does not have '${action}' permission on '${resource}'` });
    return;
  }

  Object.assign(req, { currentUserId: parseInt(userId), currentUserRole: userRole });
  next();
}
