import { NotificationBattleDisplay } from "./BattleDisplay";
import { DiscoveryDisplay } from "./DiscoveryDisplay";
import SpriteAnimation from "./SpriteAnimation";
import { GameData } from "./GameData";
import useAdventurerStore from "../hooks/useAdventurerStore";
import { soundSelector, useUiSounds } from "../hooks/useUiSound";
import { useCallback, useEffect, useState } from "react";

interface NotificationDisplayProps {
  type: string;
  notificationData: any;
}

const processAnimation = (
  type: string,
  notificationData: any,
  adventurer: any
) => {
  const gameData = new GameData();
  if (type == "Flee") {
    if (
      Array.isArray(notificationData.data) &&
      notificationData.data.some((data: any) => data.fled)
    ) {
      return gameData.ADVENTURER_ANIMATIONS["Flee"];
    } else if (
      Array.isArray(notificationData.data) &&
      notificationData.data.some(
        (data: any) => data.ambush && data.targetHealth == 0
      )
    ) {
      return gameData.ADVENTURER_ANIMATIONS["Dead"];
    } else if (
      Array.isArray(notificationData.data) &&
      notificationData.data.some((data: any) => data.ambush)
    ) {
      if (adventurer?.health === 0) {
        return gameData.ADVENTURER_ANIMATIONS["Dead"];
      } else {
        return gameData.ADVENTURER_ANIMATIONS["Ambush"];
      }
    }
  } else if (type == "Attack") {
    if (
      Array.isArray(notificationData.data) &&
      notificationData.data.some(
        (data: any) => data.attacker == "Beast" && data.targetHealth == 0
      )
    ) {
      return gameData.ADVENTURER_ANIMATIONS["Dead"];
    } else if (
      Array.isArray(notificationData.data) &&
      notificationData.data.some(
        (data: any) => data.attacker == "Adventurer" && data.targetHealth == 0
      )
    ) {
      return gameData.ADVENTURER_ANIMATIONS["Slayed"];
    } else {
      return gameData.ADVENTURER_ANIMATIONS[type];
    }
  } else if (type == "Explore") {
    if (notificationData?.discoveryType == "Beast") {
      return gameData.ADVENTURER_ANIMATIONS["DiscoverBeast"];
    } else if (notificationData?.discoveryType == "Obstacle") {
      if (notificationData?.outputAmount > 0) {
        if (adventurer?.health === 0) {
          return gameData.ADVENTURER_ANIMATIONS["Dead"];
        } else {
          return gameData.ADVENTURER_ANIMATIONS["HitByObstacle"];
        }
      } else {
        return gameData.ADVENTURER_ANIMATIONS["AvoidObstacle"];
      }
    } else if (notificationData?.discoveryType == "Item") {
      return gameData.ADVENTURER_ANIMATIONS["DiscoverItem"];
    } else if (notificationData?.discoveryType == "Nothing") {
      return gameData.ADVENTURER_ANIMATIONS["DiscoverItem"];
    }
  } else {
    return gameData.ADVENTURER_ANIMATIONS[type];
  }
};

const proccessNotification = (type: string, notificationData: any) => {
  if (type == "Attack" || type == "Flee") {
    return (
      <NotificationBattleDisplay
        battleData={notificationData.data}
        beast={notificationData.beast ? notificationData.beast : ""}
      />
    );
  } else if (type == "Explore") {
    return <DiscoveryDisplay discoveryData={notificationData} />;
  } else if (notificationData == "Rejected") {
    return (
      <p className="text-lg">
        OH NO! The transaction was rejected! Please refresh and try again incase
        of wallet issues.
      </p>
    );
  } else if (type == "Multicall") {
    <div className="flex flex-col">
      {(notificationData as string[]).map((noti: any) => (
        <p className="text-lg">{noti}</p>
      ))}
      ;
    </div>;
  } else {
    return <p className="text-lg">{notificationData}</p>;
  }
};

export const NotificationDisplay = ({
  type,
  notificationData,
}: NotificationDisplayProps) => {
  const gameData = new GameData();

  const { adventurer } = useAdventurerStore();
  const animation = processAnimation(type, notificationData, adventurer);
  console.log(notificationData);
  const notification = proccessNotification(type, notificationData);

  const [setSound, setSoundState] = useState(soundSelector.click);

  const { play } = useUiSounds(setSound);

  const playSound = useCallback(() => {
    console.log(setSound);
    play();
  }, []);

  useEffect(() => {
    if (animation) {
      const animationKey = Object.keys(gameData.ADVENTURER_ANIMATIONS).find(
        (key) => gameData.ADVENTURER_ANIMATIONS[key] === animation
      );

      console.log("animation", animationKey);
      if (animationKey && gameData.ADVENTURER_SOUNDS[animationKey]) {
        console.log("animationKey", gameData.ADVENTURER_SOUNDS[animationKey]);
        setSoundState(gameData.ADVENTURER_SOUNDS[animationKey]);
      }
      playSound();
    }
  }, [animation]);

  return (
    <div className="z-10 flex flex-row w-full gap-5 p-2">
      <div className="w-1/4">
        <SpriteAnimation
          frameWidth={100}
          frameHeight={100}
          columns={7}
          rows={16}
          frameRate={5}
          animations={[
            { name: "idle", startFrame: 0, frameCount: 4 },
            { name: "run", startFrame: 9, frameCount: 5 },
            { name: "jump", startFrame: 11, frameCount: 7 },
            { name: "attack1", startFrame: 42, frameCount: 5 },
            { name: "attack2", startFrame: 47, frameCount: 4 },
            { name: "attack3", startFrame: 55, frameCount: 6 },
            { name: "damage", startFrame: 59, frameCount: 4 },
            { name: "die", startFrame: 64, frameCount: 9 },
            { name: "drawSword", startFrame: 70, frameCount: 5 },
            { name: "discoverItem", startFrame: 85, frameCount: 6 },
          ]}
          currentAnimation={animation ?? ""}
        />
      </div>
      <div className="w-3/4 m-auto">{notification}</div>
    </div>
  );
};
