import { PrismaClient } from "@prisma/client";

export const db_video = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

// db_video.$extends({
//   result: {
//     users: {
//       name: {
//         needs: {user_name: true},
//         compute(users) {
//           return users.user_name;
//         }
//       }
//     }
//   }
// })