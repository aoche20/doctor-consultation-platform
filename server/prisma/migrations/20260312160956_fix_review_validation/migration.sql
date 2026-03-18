-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('patient', 'doctor', 'admin') NOT NULL DEFAULT 'patient',
    `profilePicture` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `gender` ENUM('male', 'female', 'other') NULL,
    `address` JSON NULL,
    `specialization` VARCHAR(191) NULL,
    `consultationFee` DOUBLE NULL DEFAULT 50,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `bio` TEXT NULL,
    `languages` JSON NULL,
    `experience` INTEGER NULL DEFAULT 0,
    `education` JSON NULL,
    `workExperience` JSON NULL,
    `insuranceAccepted` JSON NULL,
    `availableSlots` JSON NULL,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `totalReviews` INTEGER NOT NULL DEFAULT 0,
    `totalPatients` INTEGER NOT NULL DEFAULT 0,
    `responseRate` DOUBLE NOT NULL DEFAULT 0,
    `responseTime` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLogin` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appointments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `doctorId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `timeSlot` JSON NOT NULL,
    `status` ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'pending',
    `type` ENUM('video', 'audio', 'chat', 'in_person') NOT NULL DEFAULT 'video',
    `symptoms` TEXT NULL,
    `notes` TEXT NULL,
    `prescription` JSON NULL,
    `paymentStatus` ENUM('pending', 'paid', 'refunded', 'failed') NOT NULL DEFAULT 'pending',
    `paymentAmount` DOUBLE NOT NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `paymentIntentId` VARCHAR(191) NULL,
    `meetingId` VARCHAR(191) NULL,
    `meetingLink` VARCHAR(191) NULL,
    `cancellationReason` VARCHAR(191) NULL,
    `cancelledBy` INTEGER NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `appointments_paymentIntentId_key`(`paymentIntentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `doctorId` INTEGER NOT NULL,
    `appointmentId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NOT NULL,
    `tags` JSON NULL,
    `isAnonymous` BOOLEAN NOT NULL DEFAULT false,
    `isVerified` BOOLEAN NOT NULL DEFAULT true,
    `likes` JSON NULL,
    `replies` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reviews_appointmentId_key`(`appointmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
