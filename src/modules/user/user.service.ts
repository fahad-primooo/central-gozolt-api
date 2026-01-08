import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import bcrypt from 'bcrypt';

interface CreateUserInput {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  password: string;
  avatar?: string;
  bio?: string;
}

interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

export class UserService {
  async createUser(data: CreateUserInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
          {
            AND: [{ countryCode: data.countryCode }, { phoneNumber: data.phoneNumber }],
          },
        ],
      },
    });

    if (existingUser) {
      throw new ApiError(400, 'User with this email, username, or phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Generate display name
    const displayName = `${data.firstName} ${data.lastName}`;

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName,
        username: data.username,
        email: data.email,
        countryCode: data.countryCode,
        phoneNumber: data.phoneNumber,
        password: hashedPassword,
        avatar: data.avatar,
        bio: data.bio,
        phoneVerified: true, // Since they completed OTP verification
        phoneVerifiedAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        username: true,
        email: true,
        countryCode: true,
        phoneNumber: true,
        emailVerified: true,
        phoneVerified: true,
        avatar: true,
        bio: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        username: true,
        email: true,
        countryCode: true,
        phoneNumber: true,
        emailVerified: true,
        phoneVerified: true,
        avatar: true,
        bio: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        username: true,
        email: true,
        countryCode: true,
        phoneNumber: true,
        emailVerified: true,
        phoneVerified: true,
        avatar: true,
        bio: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  async getUserByUsername(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        username: true,
        email: true,
        countryCode: true,
        phoneNumber: true,
        emailVerified: true,
        phoneVerified: true,
        avatar: true,
        bio: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          displayName: true,
          username: true,
          email: true,
          countryCode: true,
          phoneNumber: true,
          emailVerified: true,
          phoneVerified: true,
          avatar: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUser(id: number, data: UpdateUserInput) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new ApiError(404, 'User not found');
    }

    // Check for conflicts
    if (data.email || data.username) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(data.email ? [{ email: data.email }] : []),
                ...(data.username ? [{ username: data.username }] : []),
              ],
            },
          ],
        },
      });

      if (conflictUser) {
        throw new ApiError(400, 'Email or username already in use');
      }
    }

    // Update display name if first or last name changes
    const displayName =
      data.firstName || data.lastName
        ? `${data.firstName || existingUser.firstName} ${data.lastName || existingUser.lastName}`
        : undefined;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        ...(displayName && { displayName }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        username: true,
        email: true,
        countryCode: true,
        phoneNumber: true,
        emailVerified: true,
        phoneVerified: true,
        avatar: true,
        bio: true,
        status: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async deleteUser(id: number, soft: boolean = true) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (soft) {
      // Soft delete
      await prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: 'DELETED',
        },
      });
    } else {
      // Hard delete
      await prisma.user.delete({
        where: { id },
      });
    }

    return { message: 'User deleted successfully' };
  }

  async verifyEmail(id: number) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        emailVerifiedAt: true,
      },
    });

    return user;
  }
}
