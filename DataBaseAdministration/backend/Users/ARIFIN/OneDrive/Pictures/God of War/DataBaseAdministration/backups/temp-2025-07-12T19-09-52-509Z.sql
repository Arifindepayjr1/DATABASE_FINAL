-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: admindb
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `content` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_approved` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`comment_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_comments_post_id` (`post_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `permission_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `permission_name` varchar(50) NOT NULL,
  PRIMARY KEY (`permission_id`),
  UNIQUE KEY `permission_id` (`permission_id`),
  UNIQUE KEY `permission_name` (`permission_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (3,'Delete'),(1,'Read'),(4,'Update'),(2,'Write');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_likes`
--

DROP TABLE IF EXISTS `post_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_likes` (
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `liked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`post_id`),
  KEY `post_id` (`post_id`),
  KEY `idx_postlikes_user_post` (`user_id`,`post_id`),
  CONSTRAINT `post_likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `post_likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_likes`
--

LOCK TABLES `post_likes` WRITE;
/*!40000 ALTER TABLE `post_likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `post_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_versions`
--

DROP TABLE IF EXISTS `post_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_versions` (
  `version_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int DEFAULT NULL,
  `version_num` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`version_id`),
  UNIQUE KEY `unique_post_version` (`post_id`,`version_num`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_post_versions_post_version` (`post_id`,`version_num`),
  CONSTRAINT `post_versions_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE,
  CONSTRAINT `post_versions_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_versions`
--

LOCK TABLES `post_versions` WRITE;
/*!40000 ALTER TABLE `post_versions` DISABLE KEYS */;
/*!40000 ALTER TABLE `post_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) DEFAULT NULL,
  `author_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_id` (`category_id`),
  KEY `idx_posts_author_id` (`author_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `insert_initial_post_version` AFTER INSERT ON `posts` FOR EACH ROW BEGIN
  INSERT INTO post_versions (post_id, version_num, title, content, updated_by)
  VALUES (NEW.post_id, 1, CONCAT('First Version of ', NEW.slug), 'Initial content.', NEW.author_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `privilege_permissions`
--

DROP TABLE IF EXISTS `privilege_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `privilege_permissions` (
  `privilege_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`privilege_id`,`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `privilege_permissions`
--

LOCK TABLES `privilege_permissions` WRITE;
/*!40000 ALTER TABLE `privilege_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `privilege_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `privileges`
--

DROP TABLE IF EXISTS `privileges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `privileges` (
  `privilege_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `privilege_name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`privilege_id`),
  UNIQUE KEY `privilege_id` (`privilege_id`),
  UNIQUE KEY `privilege_name` (`privilege_name`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `privileges`
--

LOCK TABLES `privileges` WRITE;
/*!40000 ALTER TABLE `privileges` DISABLE KEYS */;
INSERT INTO `privileges` VALUES (2,'edit_ofdsawn_dfsafasfsafpost','Edit your oasfwn pasfdasfsaffsaost'),(6,'moderate_comments','Approve or delete comments'),(7,'comment_post','Comment on posts'),(8,'like_post','Like a post'),(9,'create_post ','afdsafds'),(12,'dfa','fadsfa'),(13,'sfdgf','sdgf'),(18,'new_privilege','New privilege for testing'),(20,'new_aprivilege','New privilegea for testing'),(23,'updated_test_privilege','Updated test privilege'),(25,'new_prdfafivilege','New privilefdage with ALTER'),(26,'test_privilege','Test privilege with ALTER'),(27,'dfgsbfdsgsd','fgdsg'),(28,'create_post','dfasfsa'),(29,'post ','fgdsgdsgds'),(30,'modify_post','fdsafasfd');
/*!40000 ALTER TABLE `privileges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_privileges`
--

DROP TABLE IF EXISTS `role_privileges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_privileges` (
  `role_id` int NOT NULL,
  `privilege_id` int NOT NULL,
  PRIMARY KEY (`role_id`,`privilege_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_privileges`
--

LOCK TABLES `role_privileges` WRITE;
/*!40000 ALTER TABLE `role_privileges` DISABLE KEYS */;
INSERT INTO `role_privileges` VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(2,1),(2,3),(2,4),(2,5),(2,6),(3,1),(3,2),(3,7),(3,8),(4,7),(4,8);
/*!40000 ALTER TABLE `role_privileges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_table_privileges`
--

DROP TABLE IF EXISTS `role_table_privileges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_table_privileges` (
  `role_id` int NOT NULL,
  `privilege_id` bigint unsigned NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`,`privilege_id`),
  KEY `privilege_id` (`privilege_id`),
  CONSTRAINT `role_table_privileges_ibfk_1` FOREIGN KEY (`privilege_id`) REFERENCES `privileges` (`privilege_id`) ON DELETE CASCADE,
  CONSTRAINT `role_table_privileges_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_table_privileges`
--

LOCK TABLES `role_table_privileges` WRITE;
/*!40000 ALTER TABLE `role_table_privileges` DISABLE KEYS */;
INSERT INTO `role_table_privileges` VALUES (19,2,'2025-07-12 18:05:41'),(19,6,'2025-07-12 18:05:41'),(19,7,'2025-07-12 18:05:41'),(19,8,'2025-07-12 18:05:41'),(19,9,'2025-07-12 18:05:41'),(19,12,'2025-07-12 18:05:41'),(19,13,'2025-07-12 18:05:41'),(19,18,'2025-07-12 18:05:41'),(19,20,'2025-07-12 18:05:41'),(19,23,'2025-07-12 18:05:41'),(19,25,'2025-07-12 18:05:41'),(19,26,'2025-07-12 18:05:41'),(19,27,'2025-07-12 18:05:41'),(19,28,'2025-07-12 18:05:41'),(19,29,'2025-07-12 18:05:41'),(19,30,'2025-07-12 18:05:41'),(20,29,'2025-07-12 16:03:43'),(21,2,'2025-07-12 16:08:20'),(21,25,'2025-07-12 16:08:20'),(21,27,'2025-07-12 16:08:20'),(22,28,'2025-07-12 16:37:09'),(22,29,'2025-07-12 16:37:09'),(23,26,'2025-07-12 16:44:51'),(23,30,'2025-07-12 16:44:51');
/*!40000 ALTER TABLE `role_table_privileges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (19,'admin','fk u'),(20,'Post Watcher',NULL),(21,'dsADad',NULL),(22,'editor',NULL),(23,'PostWatcher','fsafdsafd');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `table_privileges`
--

DROP TABLE IF EXISTS `table_privileges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `table_privileges` (
  `table_privilege_id` int NOT NULL AUTO_INCREMENT,
  `privilege_id` bigint unsigned NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `actions` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`table_privilege_id`),
  KEY `privilege_id` (`privilege_id`),
  CONSTRAINT `table_privileges_ibfk_1` FOREIGN KEY (`privilege_id`) REFERENCES `privileges` (`privilege_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `table_privileges`
--

LOCK TABLES `table_privileges` WRITE;
/*!40000 ALTER TABLE `table_privileges` DISABLE KEYS */;
INSERT INTO `table_privileges` VALUES (35,6,'comments','[\"SELECT\", \"DELETE\"]','2025-07-12 11:21:26'),(36,7,'comments','[\"INSERT\"]','2025-07-12 11:21:26'),(37,8,'post_likes','[\"INSERT\"]','2025-07-12 11:21:26'),(38,9,'posts','[\"SELECT\", \"INSERT\"]','2025-07-12 11:21:26'),(39,12,'posts','[\"SELECT\", \"UPDATE\"]','2025-07-12 11:21:26'),(45,18,'posts','[\"SELECT\", \"INSERT\"]','2025-07-12 11:46:20'),(46,18,'comments','[\"DELETE\"]','2025-07-12 11:46:20'),(47,20,'posts','[\"SELECT\", \"INSERT\"]','2025-07-12 11:49:39'),(48,20,'comments','[\"DELETE\"]','2025-07-12 11:49:39'),(55,23,'posts','[\"SELECT\", \"INSERT\"]','2025-07-12 11:58:47'),(56,23,'comments','[\"DELETE\"]','2025-07-12 11:58:47'),(57,25,'posts','[\"SELECT\", \"INSERT\", \"ALTER\"]','2025-07-12 13:58:41'),(58,25,'comments','[\"DELETE\", \"ALTER\"]','2025-07-12 13:58:41'),(61,26,'posts','[\"SELECT\", \"INSERT\", \"ALTER\"]','2025-07-12 14:14:47'),(62,26,'comments','[\"DELETE\", \"ALTER\"]','2025-07-12 14:14:47'),(63,13,'posts','[\"SELECT\", \"INSERT\"]','2025-07-12 14:18:28'),(70,27,'tables','[\"INSERT\", \"UPDATE\", \"DELETE\"]','2025-07-12 15:29:27'),(71,2,'posts','[\"UPDATE\"]','2025-07-12 15:29:47'),(72,2,'privilege_permissions','[\"INSERT\", \"UPDATE\"]','2025-07-12 15:29:47'),(73,28,'post_likes','[\"INSERT\", \"UPDATE\", \"DELETE\", \"SELECT\", \"ALTER\"]','2025-07-12 15:45:14'),(74,29,'post_versions','[\"SELECT\", \"INSERT\", \"UPDATE\", \"DELETE\", \"ALTER\"]','2025-07-12 16:03:18'),(75,30,'posts','[\"SELECT\", \"INSERT\", \"UPDATE\", \"DELETE\", \"ALTER\"]','2025-07-12 16:44:17');
/*!40000 ALTER TABLE `table_privileges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tables`
--

DROP TABLE IF EXISTS `tables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tables` (
  `table_id` int NOT NULL AUTO_INCREMENT,
  `table_name` varchar(100) NOT NULL,
  PRIMARY KEY (`table_id`),
  UNIQUE KEY `table_name` (`table_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tables`
--

LOCK TABLES `tables` WRITE;
/*!40000 ALTER TABLE `tables` DISABLE KEYS */;
/*!40000 ALTER TABLE `tables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_deletions_log`
--

DROP TABLE IF EXISTS `user_deletions_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_deletions_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deleted_user_id` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_deletions_log`
--

LOCK TABLES `user_deletions_log` WRITE;
/*!40000 ALTER TABLE `user_deletions_log` DISABLE KEYS */;
INSERT INTO `user_deletions_log` VALUES (1,21,'2025-07-12 17:12:59'),(2,24,'2025-07-12 17:13:01'),(3,25,'2025-07-12 17:13:03'),(4,27,'2025-07-12 17:13:05'),(5,26,'2025-07-12 17:13:07'),(6,30,'2025-07-12 17:13:09'),(7,29,'2025-07-12 17:13:10'),(8,31,'2025-07-12 17:13:13');
/*!40000 ALTER TABLE `user_deletions_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  KEY `idx_user_roles_user_id` (`user_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` text,
  `bio` text,
  `profile_pic_url` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(10) DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (32,'admin133242','arifindepayjr','arifindepayjr@gmail.com','$2b$10$BtOYo5KrcDXxVHKs8PE5DeXugAZt1lKeOsKufH65hXEyjN.E.Gmc6',NULL,NULL,'2025-07-12 16:24:33','active',19),(34,NULL,'Emily',NULL,'$2b$10$HuvDmyGFsxF8vJhVG7uSCeP2BrcqhjB1ukWbwpRyd.iejDplZJ99K',NULL,NULL,'2025-07-12 16:37:27','active',22),(35,NULL,'LordKanzaki',NULL,'$2b$10$dg/Wsuy1bm7v082bGpHUHOLprkhaZDW86dt2MVuO8HFfRw5nOhdDe',NULL,NULL,'2025-07-12 16:45:24','active',23);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `log_user_deletion` BEFORE DELETE ON `users` FOR EACH ROW BEGIN
  INSERT INTO user_deletions_log (deleted_user_id)
  VALUES (OLD.user_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-13  2:09:52
