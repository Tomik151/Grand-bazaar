CREATE TABLE `advert` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`titul` text NOT NULL,
	`popis` text NOT NULL,
	`cena` integer NOT NULL,
	`kategorie` text NOT NULL,
	`status` text NOT NULL,
	`obrazek` text,
	`kontaktJmeno` text NOT NULL,
	`kontaktEmail` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_message` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`advertId` integer NOT NULL,
	`buyerEmail` text NOT NULL,
	`buyerName` text NOT NULL,
	`senderEmail` text NOT NULL,
	`text` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`advertId`) REFERENCES `advert`(`id`) ON UPDATE no action ON DELETE cascade
);
