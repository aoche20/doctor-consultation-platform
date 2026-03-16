'use client';

import { useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

interface VideoRoomProps {
  roomID: string;
  userName: string;
  userID: string;
  role?: 'patient' | 'doctor';
  onEndCall?: () => void;
}

export default function VideoRoom({ roomID, userName, userID, role = 'patient', onEndCall }: VideoRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMeeting = async () => {
      if (!containerRef.current) return;

      const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;

      // Générer un token pour l'utilisateur
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        userName
      );

      // Créer l'instance
      const zp = ZegoUIKitPrebuilt.create(kitToken);

      // Rejoindre la salle
      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall, // Appel 1-1
        },
        showScreenSharingButton: false,
        showTextChat: true,
        showUserList: true,
        showRoomDetailsButton: true,
        showLayoutButton: true,
        showPreJoinView: true, // Afficher la vue de pré-join (caméra/micro)
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        onEnd: () => {
          if (onEndCall) onEndCall();
        },
      });
    };

    initMeeting();

    // Nettoyage
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [roomID, userName, userID, onEndCall]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-screen"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}