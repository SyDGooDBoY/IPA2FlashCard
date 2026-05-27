-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: flashcard_app
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `deck`
--

DROP TABLE IF EXISTS `deck`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deck` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `owner_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  KEY `ix_deck_title` (`title`),
  CONSTRAINT `deck_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deck`
--

LOCK TABLES `deck` WRITE;
/*!40000 ALTER TABLE `deck` DISABLE KEYS */;
INSERT INTO `deck` VALUES (1,'Starter Deck','Built-in flashcards for new users.',1,'2026-05-27 10:03:22'),(2,'Math','Quick arithmetic and math concept practice.',1,'2026-05-27 10:03:22'),(3,'Food','Food vocabulary and nutrition basics.',1,'2026-05-27 10:03:22'),(4,'Starter Deck','Built-in flashcards for new users.',2,'2026-05-27 10:04:02'),(5,'Math','Quick arithmetic and math concept practice.',2,'2026-05-27 10:04:02'),(6,'Food','Food vocabulary and nutrition basics.',2,'2026-05-27 10:04:02');
/*!40000 ALTER TABLE `deck` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flashcard`
--

DROP TABLE IF EXISTS `flashcard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcard` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` text COLLATE utf8mb4_unicode_ci,
  `answer` text COLLATE utf8mb4_unicode_ci,
  `deck_id` int NOT NULL,
  `owner_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `deck_id` (`deck_id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `flashcard_ibfk_1` FOREIGN KEY (`deck_id`) REFERENCES `deck` (`id`),
  CONSTRAINT `flashcard_ibfk_2` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flashcard`
--

LOCK TABLES `flashcard` WRITE;
/*!40000 ALTER TABLE `flashcard` DISABLE KEYS */;
INSERT INTO `flashcard` VALUES (1,'What is React?','React is a JavaScript library for building interactive user interfaces.',1,1,'2026-05-27 10:03:22'),(2,'What is useState?','useState is a React Hook used to manage local component state.',1,1,'2026-05-27 10:03:22'),(3,'What is FastAPI?','FastAPI is a Python framework for building APIs quickly.',1,1,'2026-05-27 10:03:22'),(4,'What is SQL?','SQL is a language used to manage and query relational databases.',1,1,'2026-05-27 10:03:22'),(5,'What is JWT?','JWT is a signed token used to authenticate users after login.',1,1,'2026-05-27 10:03:22'),(6,'What is 7 x 8?','56.',2,1,'2026-05-27 10:03:22'),(7,'What is the square root of 81?','9.',2,1,'2026-05-27 10:03:22'),(8,'What is 15% of 200?','30.',2,1,'2026-05-27 10:03:22'),(9,'What is the formula for the area of a triangle?','Area = 1/2 x base x height.',2,1,'2026-05-27 10:03:22'),(10,'What is a prime number?','A number greater than 1 that has exactly two factors: 1 and itself.',2,1,'2026-05-27 10:03:22'),(11,'Which food group is rice mainly part of?','Grains or carbohydrates.',3,1,'2026-05-27 10:03:22'),(12,'What vitamin is oranges famous for?','Vitamin C.',3,1,'2026-05-27 10:03:22'),(13,'What is tofu commonly made from?','Soybeans.',3,1,'2026-05-27 10:03:22'),(14,'What does vegetarian mean?','A diet that does not include meat.',3,1,'2026-05-27 10:03:22'),(15,'Which nutrient is commonly associated with eggs, fish, and beans?','Protein.',3,1,'2026-05-27 10:03:22'),(16,'What is React?','React is a JavaScript library for building interactive user interfaces.',4,2,'2026-05-27 10:04:02'),(17,'What is useState?','useState is a React Hook used to manage local component state.',4,2,'2026-05-27 10:04:02'),(18,'What is FastAPI?','FastAPI is a Python framework for building APIs quickly.',4,2,'2026-05-27 10:04:02'),(19,'What is SQL?','SQL is a language used to manage and query relational databases.',4,2,'2026-05-27 10:04:02'),(20,'What is JWT?','JWT is a signed token used to authenticate users after login.',4,2,'2026-05-27 10:04:02'),(21,'What is 7 x 8?','56.',5,2,'2026-05-27 10:04:02'),(22,'What is the square root of 81?','9.',5,2,'2026-05-27 10:04:02'),(23,'What is 15% of 200?','30.',5,2,'2026-05-27 10:04:02'),(24,'What is the formula for the area of a triangle?','Area = 1/2 x base x height.',5,2,'2026-05-27 10:04:02'),(25,'What is a prime number?','A number greater than 1 that has exactly two factors: 1 and itself.',5,2,'2026-05-27 10:04:02'),(26,'Which food group is rice mainly part of?','Grains or carbohydrates.',6,2,'2026-05-27 10:04:02'),(27,'What vitamin is oranges famous for?','Vitamin C.',6,2,'2026-05-27 10:04:02'),(28,'What is tofu commonly made from?','Soybeans.',6,2,'2026-05-27 10:04:02'),(29,'What does vegetarian mean?','A diet that does not include meat.',6,2,'2026-05-27 10:04:02'),(30,'Which nutrient is commonly associated with eggs, fish, and beans?','Protein.',6,2,'2026-05-27 10:04:02');
/*!40000 ALTER TABLE `flashcard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashed_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_user_username` (`username`),
  KEY `ix_user_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','admin@example.com','$2b$12$Qz4KXtkkCMBWpKQR4rnQdOX9yVBC.mMn9tSJobgX5NtYP0NCxaR6i','admin','2026-05-27 10:03:19'),(2,'111','jeason1w@gmail.com','$2b$12$gyp/JbbO2.3xD3RadZLXA.0xMkWqBY418G.wN57719YkdvG9IvuIi','user','2026-05-27 10:04:02');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `viewhistory`
--

DROP TABLE IF EXISTS `viewhistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `viewhistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `flashcard_id` int NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `viewed_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `flashcard_id` (`flashcard_id`),
  CONSTRAINT `viewhistory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `viewhistory_ibfk_2` FOREIGN KEY (`flashcard_id`) REFERENCES `flashcard` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `viewhistory`
--

LOCK TABLES `viewhistory` WRITE;
/*!40000 ALTER TABLE `viewhistory` DISABLE KEYS */;
INSERT INTO `viewhistory` VALUES (1,2,20,1,'2026-05-27 10:11:30'),(2,2,19,1,'2026-05-27 10:11:31');
/*!40000 ALTER TABLE `viewhistory` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-27 22:27:15
