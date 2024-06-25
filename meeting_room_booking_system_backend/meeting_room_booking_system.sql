-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: meeting_room_booking_system
-- ------------------------------------------------------
-- Server version	5.7.36

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
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `startTime` datetime NOT NULL COMMENT '会议开始时间',
  `endTime` datetime NOT NULL COMMENT '会议结束时间',
  `status` varchar(20) NOT NULL DEFAULT '申请中' COMMENT '状态(申请中、审批通过、审批驳回、已解除)',
  `note` varchar(100) NOT NULL DEFAULT '' COMMENT '备注',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '修改时间',
  `userId` int(11) DEFAULT NULL,
  `roomId` int(11) DEFAULT NULL COMMENT '会议室ID',
  PRIMARY KEY (`id`),
  KEY `FK_336b3f4a235460dc93645fbf222` (`userId`),
  KEY `FK_769a5e375729258fd0bbfc0a456` (`roomId`),
  CONSTRAINT `FK_336b3f4a235460dc93645fbf222` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_769a5e375729258fd0bbfc0a456` FOREIGN KEY (`roomId`) REFERENCES `meeting_room` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking`
--

LOCK TABLES `booking` WRITE;
/*!40000 ALTER TABLE `booking` DISABLE KEYS */;
INSERT INTO `booking` VALUES (1,'2024-04-11 16:04:15','2024-04-11 17:04:15','审批通过','','2024-04-11 08:04:14.720789','2024-04-15 08:11:21.000000',7,1),(2,'2024-04-11 16:04:15','2024-04-11 17:04:15','已解除','','2024-04-11 08:04:14.734214','2024-04-15 08:12:46.000000',8,3),(3,'2024-04-11 16:04:15','2024-04-11 17:04:15','审批驳回','','2024-04-11 08:04:14.742281','2024-04-15 08:12:42.000000',8,1),(4,'2024-04-11 16:04:15','2024-04-11 17:04:15','申请中','','2024-04-11 08:04:14.752789','2024-04-11 08:04:14.752789',7,3),(5,'2024-04-16 01:00:00','2024-04-16 02:00:00','申请中','','2024-04-16 06:53:00.793906','2024-04-16 06:53:00.793906',5,1),(6,'2024-04-16 00:02:00','2024-04-16 01:30:00','申请中','','2024-04-16 06:57:04.966213','2024-04-16 06:57:04.966213',5,1),(7,'2024-04-16 00:00:00','2024-04-16 02:00:00','申请中','','2024-04-16 06:57:58.076140','2024-04-16 06:57:58.076140',5,1),(8,'2024-04-17 07:00:00','2024-04-17 08:00:00','申请中','','2024-04-17 08:21:07.873829','2024-04-17 08:21:07.873829',5,1),(9,'2024-04-17 00:00:00','2024-04-17 18:00:00','已解除','','2024-04-17 08:21:32.427608','2024-04-17 08:42:04.000000',5,1);
/*!40000 ALTER TABLE `booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meeting_room`
--

DROP TABLE IF EXISTS `meeting_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meeting_room` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '会议室ID',
  `name` varchar(50) NOT NULL COMMENT '会议室名字',
  `capacity` int(11) NOT NULL COMMENT '会议室容量',
  `location` varchar(50) NOT NULL COMMENT '会议室位置',
  `equipment` varchar(50) NOT NULL DEFAULT '' COMMENT '设备',
  `description` varchar(100) NOT NULL DEFAULT '' COMMENT '描述',
  `isBooked` tinyint(4) NOT NULL DEFAULT '0' COMMENT '是否被预定',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '修改时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meeting_room`
--

LOCK TABLES `meeting_room` WRITE;
/*!40000 ALTER TABLE `meeting_room` DISABLE KEYS */;
INSERT INTO `meeting_room` VALUES (1,'木星',10,'一层西','白板,电视','木星会议室',0,'2024-03-25 06:43:40.321000','2024-03-25 06:43:40.321000'),(3,'天王星',30,'三层东','白板,电视','',0,'2024-03-25 06:43:40.347180','2024-03-25 06:43:40.347180'),(5,'水星',20,'二楼东','白板','水星会议室',0,'2024-04-07 07:50:12.241682','2024-04-07 07:50:12.241682');
/*!40000 ALTER TABLE `meeting_room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL COMMENT '权限代码',
  `description` varchar(100) NOT NULL COMMENT '权限描述',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'ccc','访问 ccc 接口'),(2,'ddd','访问 ddd 接口'),(3,'meeting-room/list','访问会议室 list 接口'),(4,'meeting-room/create','访问会议室 create 接口'),(5,'meeting-room','访问会议室接口'),(6,'meeting-room/update','访问会议室 update 接口'),(7,'meeting-room/delete','访问会议室 delete 接口');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `rolesId` int(11) NOT NULL,
  `permissionsId` int(11) NOT NULL,
  PRIMARY KEY (`rolesId`,`permissionsId`),
  KEY `IDX_0cb93c5877d37e954e2aa59e52` (`rolesId`),
  KEY `IDX_d422dabc78ff74a8dab6583da0` (`permissionsId`),
  CONSTRAINT `FK_0cb93c5877d37e954e2aa59e52c` FOREIGN KEY (`rolesId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_d422dabc78ff74a8dab6583da02` FOREIGN KEY (`permissionsId`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(2,1),(2,3),(2,5);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL COMMENT '角色名',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'管理员'),(2,'普通用户');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `usersId` int(11) NOT NULL,
  `rolesId` int(11) NOT NULL,
  PRIMARY KEY (`usersId`,`rolesId`),
  KEY `IDX_99b019339f52c63ae615358738` (`usersId`),
  KEY `IDX_13380e7efec83468d73fc37938` (`rolesId`),
  CONSTRAINT `FK_13380e7efec83468d73fc37938e` FOREIGN KEY (`rolesId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_99b019339f52c63ae6153587380` FOREIGN KEY (`usersId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (4,1),(5,2);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(50) NOT NULL COMMENT '密码',
  `nick_name` varchar(50) NOT NULL COMMENT '昵称',
  `email` varchar(50) NOT NULL COMMENT '邮箱',
  `headPic` varchar(100) DEFAULT NULL COMMENT '头像',
  `phoneNumber` varchar(20) DEFAULT NULL COMMENT '手机号',
  `isFrozen` tinyint(4) NOT NULL DEFAULT '0' COMMENT '是否冻结',
  `isAdmin` tinyint(4) NOT NULL DEFAULT '0' COMMENT '是否是管理员',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_fe0bb3f6520ee0469504521e71` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'guang','e10adc3949ba59abbe56e057f20f883e','神说要有光','xxxx@xx.com',NULL,NULL,0,0,'2024-02-23 07:34:45.528670','2024-02-23 07:34:45.528670'),(3,'dong','e10adc3949ba59abbe56e057f20f883e','神说要有东','33eaa538410b@drmail.in',NULL,NULL,0,0,'2024-02-23 09:55:34.678793','2024-02-23 09:55:34.678793'),(4,'zhangsan','e10adc3949ba59abbe56e057f20f883e','张三','37e119e9a3bc@drmail.in','uploads\\1711337266005-486476312-1111.jpg','13233323333',0,1,'2024-02-23 10:10:45.571228','2024-03-25 05:49:56.000000'),(5,'lisi','e3ceb5881a0a1fdaad01296d7554868d','李四','yy@yy.com',NULL,NULL,0,0,'2024-02-23 10:10:45.586241','2024-02-23 10:10:45.586241'),(6,'dong2','96e79218965eb72c92a549dd5a330112','神说要有东修改','69d9e1545736@drmail.in','http://192.168.197.77:9000/aaa/1111.jpg',NULL,1,0,'2024-03-01 08:30:08.922746','2024-03-08 03:16:19.000000'),(7,'guiyu','96e79218965eb72c92a549dd5a330112','桂桂2','866b9ae23276@drmail.in','uploads\\1710396034006-64017866-111.gif',NULL,0,0,'2024-03-13 03:18:39.326577','2024-03-14 06:02:52.000000'),(8,'piziyu','e10adc3949ba59abbe56e057f20f883e','痞子鱼','3a7edd71f3e9@drmail.in',NULL,NULL,1,0,'2024-03-13 05:41:42.142001','2024-03-20 10:22:21.000000');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'meeting_room_booking_system'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-25 14:56:00
