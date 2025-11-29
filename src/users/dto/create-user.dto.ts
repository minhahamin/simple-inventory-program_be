export class CreateUserDto {
  userId: string;
  userName: string;
  role: string;
  department: string;
  email: string;
  status?: string;
  description?: string;
}
