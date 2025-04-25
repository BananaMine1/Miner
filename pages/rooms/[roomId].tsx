import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import type { GetStaticPaths, GetStaticProps } from 'next';
import type { RoomConfig } from '../../lib/rooms';
import { getAllRooms, getRoomById } from '../../lib/rooms';

const RoomScene = dynamic(() => import('../../components/Pixi/RoomScene'), { ssr: false });

export default function Room({ room }: { room: RoomConfig }) {
  return (
    <>
      <Head><title>{room.name}</title></Head>
      <RoomScene
        isNight={room.isNight}
        miners={room.miners}
        gridCols={room.gridCols}
        gridRows={room.gridRows}
        backgroundUrl={room.backgroundUrl}
        gridTileUrl={room.gridTileUrl}
        name={room.name}
        wattOutput={room.wattOutput}
      />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const rooms = getAllRooms();
  const paths = rooms.map((room) => ({
    params: { roomId: room.id },
  }));

  return {
    paths: paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const room = getRoomById(params?.roomId as string);

  if (!room) {
    return { notFound: true };
  }

  return {
    props: {
      room,
    },
  };
}; 