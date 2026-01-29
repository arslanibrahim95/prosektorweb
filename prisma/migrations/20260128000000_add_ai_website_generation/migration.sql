-- AI Website Generation Feature Migration
-- Adds tables for managing AI-generated websites with version control

-- ==========================================
-- AI GENERATION JOBS
-- ==========================================

CREATE TABLE `AIGenerationJob` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `companyId` VARCHAR(36) NULL,
    `prompt` TEXT NOT NULL,
    `promptHash` VARCHAR(64) NOT NULL,
    `status` ENUM('PENDING', 'ANALYZING', 'DESIGNING', 'GENERATING_CONTENT', 'GENERATING_CODE', 'BUILDING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `currentStep` VARCHAR(50) NULL,
    `progress` INT NOT NULL DEFAULT 0,
    `stepsCompleted` INT NOT NULL DEFAULT 0,
    `totalSteps` INT NOT NULL DEFAULT 5,
    
    -- Analysis Results
    `analysisResult` JSON NULL,
    `designResult` JSON NULL,
    `contentResult` JSON NULL,
    `codeResult` JSON NULL,
    
    -- Error Handling
    `errorMessage` TEXT NULL,
    `errorCode` VARCHAR(50) NULL,
    `retryCount` INT NOT NULL DEFAULT 0,
    `maxRetries` INT NOT NULL DEFAULT 3,
    
    -- Metadata
    `estimatedDuration` INT NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    
    -- Version Control
    `version` BIGINT NOT NULL DEFAULT 0,
    `isLatest` BOOLEAN NOT NULL DEFAULT TRUE,
    `parentJobId` VARCHAR(36) NULL,
    
    PRIMARY KEY (`id`),
    INDEX `AIGenerationJob_userId_idx` (`userId`),
    INDEX `AIGenerationJob_companyId_idx` (`companyId`),
    INDEX `AIGenerationJob_status_idx` (`status`),
    INDEX `AIGenerationJob_createdAt_idx` (`createdAt`),
    INDEX `AIGenerationJob_isLatest_idx` (`isLatest`),
    INDEX `AIGenerationJob_promptHash_idx` (`promptHash`),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`parentJobId`) REFERENCES `AIGenerationJob`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- GENERATED WEBSITE VERSIONS
-- ==========================================

CREATE TABLE `GeneratedWebsite` (
    `id` VARCHAR(36) NOT NULL,
    `jobId` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `companyId` VARCHAR(36) NULL,
    
    -- Website Metadata
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `template` VARCHAR(100) NOT NULL DEFAULT 'default',
    
    -- Generated Assets
    `siteStructure` JSON NOT NULL,
    `pages` JSON NOT NULL,
    `components` JSON NULL,
    `styles` JSON NULL,
    `assets` JSON NULL,
    
    -- Source Code
    `sourceCode` LONGTEXT NULL,
    `buildOutput` LONGTEXT NULL,
    
    -- Preview
    `previewUrl` VARCHAR(500) NULL,
    `thumbnailUrl` VARCHAR(500) NULL,
    
    -- Version Control
    `version` INT NOT NULL DEFAULT 1,
    `versionLabel` VARCHAR(100) NULL,
    `versionNotes` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT FALSE,
    `isDeployed` BOOLEAN NOT NULL DEFAULT FALSE,
    `deployedAt` DATETIME(3) NULL,
    `deployedUrl` VARCHAR(500) NULL,
    
    -- Rollback Support
    `canRollback` BOOLEAN NOT NULL DEFAULT TRUE,
    `rollbackToVersion` INT NULL,
    
    -- Metadata
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE INDEX `GeneratedWebsite_slug_version_key` (`slug`, `version`),
    INDEX `GeneratedWebsite_jobId_idx` (`jobId`),
    INDEX `GeneratedWebsite_userId_idx` (`userId`),
    INDEX `GeneratedWebsite_companyId_idx` (`companyId`),
    INDEX `GeneratedWebsite_isActive_idx` (`isActive`),
    INDEX `GeneratedWebsite_isDeployed_idx` (`isDeployed`),
    INDEX `GeneratedWebsite_createdAt_idx` (`createdAt`),
    FOREIGN KEY (`jobId`) REFERENCES `AIGenerationJob`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- GENERATION TEMPLATES
-- ==========================================

CREATE TABLE `GenerationTemplate` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(100) NOT NULL,
    
    -- Template Configuration
    `promptTemplate` TEXT NOT NULL,
    `systemPrompt` TEXT NULL,
    `structureTemplate` JSON NOT NULL,
    `defaultStyles` JSON NULL,
    
    -- Template Settings
    `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
    `isPublic` BOOLEAN NOT NULL DEFAULT TRUE,
    `isPremium` BOOLEAN NOT NULL DEFAULT FALSE,
    `complexity` ENUM('SIMPLE', 'MODERATE', 'COMPLEX') NOT NULL DEFAULT 'MODERATE',
    `estimatedDuration` INT NULL,
    
    -- Usage Stats
    `usageCount` INT NOT NULL DEFAULT 0,
    `rating` DECIMAL(3,2) NULL,
    `ratingCount` INT NOT NULL DEFAULT 0,
    
    -- Metadata
    `createdBy` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE INDEX `GenerationTemplate_slug_key` (`slug`),
    INDEX `GenerationTemplate_category_idx` (`category`),
    INDEX `GenerationTemplate_isActive_idx` (`isActive`),
    INDEX `GenerationTemplate_isPublic_idx` (`isPublic`),
    FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- GENERATION PRESETS (User Saved Configs)
-- ==========================================

CREATE TABLE `GenerationPreset` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    
    -- Preset Configuration
    `basePrompt` TEXT NOT NULL,
    `templateId` VARCHAR(36) NULL,
    `customSettings` JSON NULL,
    
    -- Metadata
    `isFavorite` BOOLEAN NOT NULL DEFAULT FALSE,
    `usageCount` INT NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    
    PRIMARY KEY (`id`),
    INDEX `GenerationPreset_userId_idx` (`userId`),
    INDEX `GenerationPreset_templateId_idx` (`templateId`),
    INDEX `GenerationPreset_isFavorite_idx` (`isFavorite`),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`templateId`) REFERENCES `GenerationTemplate`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- GENERATION ACTIVITY LOG
-- ==========================================

CREATE TABLE `GenerationActivity` (
    `id` VARCHAR(36) NOT NULL,
    `jobId` VARCHAR(36) NOT NULL,
    `websiteId` VARCHAR(36) NULL,
    `userId` VARCHAR(36) NOT NULL,
    
    -- Activity Details
    `activityType` ENUM('JOB_CREATED', 'JOB_STARTED', 'STEP_COMPLETED', 'JOB_COMPLETED', 'JOB_FAILED', 'JOB_CANCELLED', 'VERSION_CREATED', 'DEPLOYED', 'ROLLED_BACK', 'CLONED', 'EDITED', 'DELETED') NOT NULL,
    `stepName` VARCHAR(50) NULL,
    `details` JSON NULL,
    `metadata` JSON NULL,
    
    -- Timestamps
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    PRIMARY KEY (`id`),
    INDEX `GenerationActivity_jobId_idx` (`jobId`),
    INDEX `GenerationActivity_websiteId_idx` (`websiteId`),
    INDEX `GenerationActivity_userId_idx` (`userId`),
    INDEX `GenerationActivity_activityType_idx` (`activityType`),
    INDEX `GenerationActivity_createdAt_idx` (`createdAt`),
    FOREIGN KEY (`jobId`) REFERENCES `AIGenerationJob`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`websiteId`) REFERENCES `GeneratedWebsite`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- GENERATION RATE LIMITS
-- ==========================================

CREATE TABLE `GenerationRateLimit` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    
    -- Rate Limit Tracking
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `requestsCount` INT NOT NULL DEFAULT 0,
    `requestsLimit` INT NOT NULL DEFAULT 10,
    
    -- Usage Stats
    `tokensUsed` INT NOT NULL DEFAULT 0,
    `estimatedCost` DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
    
    -- Metadata
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE INDEX `GenerationRateLimit_userId_periodStart_key` (`userId`, `periodStart`),
    INDEX `GenerationRateLimit_periodEnd_idx` (`periodEnd`),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- INSERT DEFAULT TEMPLATES
-- ==========================================

INSERT INTO `GenerationTemplate` (`id`, `name`, `slug`, `description`, `category`, `promptTemplate`, `systemPrompt`, `structureTemplate`, `complexity`, `estimatedDuration`) VALUES
('tmpl_osgb_basic', 'OSGB Basic', 'osgb-basic', 'Temel OSGB firması web sitesi şablonu', 'osgb', 
'{{companyName}} için profesyonel bir OSGB web sitesi oluştur. Hizmetler: {{services}}. Sektör: {{industry}}.', 
'Sen deneyimli bir web tasarımcısı ve içerik yazarısın. OSGB sektöründe profesyonel, güvenilir ve modern web siteleri tasarlıyorsun.',
'{"pages": ["homepage", "about", "services", "contact"], "sections": ["hero", "features", "testimonials", "cta"]}',
'SIMPLE', 300),

('tmpl_osgb_premium', 'OSGB Premium', 'osgb-premium', 'Gelişmiş OSGB firması web sitesi şablonu', 'osgb',
'{{companyName}} için premium kalitede, çok sayfalı profesyonel OSGB web sitesi. Hizmetler: {{services}}. Özellikler: blog, portfolyo, ekip tanıtımı.',
'Sen premium web tasarım ajansısın. Lüks ve profesyonel OSGB web siteleri tasarlıyorsun. Modern tasarım trendlerini takip ediyorsun.',
'{"pages": ["homepage", "about", "services", "blog", "team", "portfolio", "contact"], "sections": ["hero", "features", "stats", "testimonials", "blog-preview", "team", "cta"]}',
'COMPLEX', 600),

('tmpl_corporate', 'Corporate Business', 'corporate-business', 'Kurumsal işletme web sitesi şablonu', 'corporate',
'{{companyName}} için kurumsal kimliğe uygun profesyonel web sitesi. Sektör: {{industry}}.',
'Sen kurumsal web tasarım uzmanısın. Profesyonel, güvenilir ve kurumsal kimliğe uygun web siteleri tasarlıyorsun.',
'{"pages": ["homepage", "about", "services", "contact"], "sections": ["hero", "about-preview", "services", "clients", "contact"]}',
'MODERATE', 400);

-- ==========================================
-- ADD PERMISSION CHECK FUNCTION
-- ==========================================

DELIMITER //

CREATE FUNCTION `canUserGenerateWebsite`(
    p_userId VARCHAR(36),
    p_role VARCHAR(20)
) RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_canGenerate BOOLEAN DEFAULT FALSE;
    DECLARE v_rateLimitHit BOOLEAN DEFAULT FALSE;
    DECLARE v_currentCount INT;
    DECLARE v_limit INT;
    
    -- Check if user has admin role
    IF p_role = 'ADMIN' THEN
        SET v_canGenerate = TRUE;
    ELSE
        -- Check rate limit for non-admin users
        SELECT 
            requestsCount >= requestsLimit,
            requestsCount,
            requestsLimit
        INTO 
            v_rateLimitHit,
            v_currentCount,
            v_limit
        FROM `GenerationRateLimit`
        WHERE userId = p_userId
        AND periodEnd > NOW()
        ORDER BY periodStart DESC
        LIMIT 1;
        
        -- If no rate limit record or not hit, allow generation
        IF v_rateLimitHit IS NULL OR v_rateLimitHit = FALSE THEN
            SET v_canGenerate = TRUE;
        END IF;
    END IF;
    
    RETURN v_canGenerate;
END //

DELIMITER ;
