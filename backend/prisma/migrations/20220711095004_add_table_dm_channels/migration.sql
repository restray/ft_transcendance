-- CreateTable
CREATE TABLE "DMChannel" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "DMChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DMChannelUser" (
    "userId" INTEGER NOT NULL,
    "DmChannel" INTEGER NOT NULL,

    CONSTRAINT "DMChannelUser_pkey" PRIMARY KEY ("userId","DmChannel")
);

-- CreateTable
CREATE TABLE "DMChannelMessage" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "type" "ChannelMessageType" NOT NULL DEFAULT 'MESSAGE',
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "DmChannel" INTEGER NOT NULL,

    CONSTRAINT "DMChannelMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DMChannelUser" ADD CONSTRAINT "DMChannelUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DMChannelUser" ADD CONSTRAINT "DMChannelUser_DmChannel_fkey" FOREIGN KEY ("DmChannel") REFERENCES "DMChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DMChannelMessage" ADD CONSTRAINT "DMChannelMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DMChannelMessage" ADD CONSTRAINT "DMChannelMessage_DmChannel_fkey" FOREIGN KEY ("DmChannel") REFERENCES "DMChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DMChannelMessage" ADD CONSTRAINT "DMChannelMessage_userId_DmChannel_fkey" FOREIGN KEY ("userId", "DmChannel") REFERENCES "DMChannelUser"("userId", "DmChannel") ON DELETE CASCADE ON UPDATE CASCADE;
