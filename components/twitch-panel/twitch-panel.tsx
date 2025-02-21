import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Flex,
  Grid,
  Group,
  MediaQuery,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { IconBrandTwitch, IconCircle } from "@tabler/icons";
import { TwitchStream } from "../../src/coh3/coh3-types";
import ChannelList from "./channel-list";
import { mobileCheck } from "../../src/utils";

declare global {
  interface Window {
    Twitch: any;
  }
}

type Props = {
  twitchStreams: TwitchStream[] | null;
  error: Error | null;
};
const TwitchPanel = ({ twitchStreams }: Props) => {
  const { colorScheme } = useMantineColorScheme();
  const [player, setPlayer] = useState<any>();
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);

  const currentStream = useMemo(() => {
    return twitchStreams && twitchStreams[currentChannelIndex];
  }, [twitchStreams, currentChannelIndex]);

  useEffect(() => {
    // this gate only be needed because of react strict mode running things twice
    if (document.getElementById("twitch-script") !== null || twitchStreams === null) return;

    const script = document.createElement("script");
    script.src = "https://player.twitch.tv/js/embed/v1.js";
    script.id = "twitch-script";
    document.body.appendChild(script);

    script.addEventListener("load", () => {
      //we have to embed video when component mount, this is not the best solution but works
      //if there is iframe, to prevent embed

      const liveDOM = document.getElementById("twitch-embed");
      if (liveDOM?.children?.length !== 0) return null;

      const embed = new window.Twitch.Embed("twitch-embed", {
        width: "100%",
        height: "100%",
        channel: twitchStreams[0].user_login,
        layout: "video",
        autoplay: false,
        theme: colorScheme,
        muted: true,
      });

      embed.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
        const player = embed.getPlayer();
        // maybe unneeded because of option above but can't hurt
        player.setMuted(true);
        if (!mobileCheck()) player.play();
        setPlayer(player);
      });
    });

    return () => {
      //remove twitch script when component unmount
      document.getElementById("twitch-script")?.remove();
    };
  }, [twitchStreams, colorScheme]);

  function handleChangeChannel(channelIndex: number) {
    if (!twitchStreams) return;
    setCurrentChannelIndex(channelIndex);
    player.setChannel(twitchStreams[channelIndex].user_login);
    player.play();
  }

  return (
    <Container size="fluid" px={"xs"} pb={5}>
      <Flex justify="flex-start" align="center" gap={5} pb="sm">
        <IconBrandTwitch size={40} />
        <Title order={2} size="h2">
          Watch Live Streams
        </Title>
      </Flex>

      <Grid grow>
        <Grid.Col md={9} sm={12}>
          <Box style={{ aspectRatio: 16 / 9 }} id="twitch-embed"></Box>
        </Grid.Col>

        <Grid.Col md={3} sm={12}>
          {twitchStreams && (
            <ChannelList onChangeChannel={handleChangeChannel} twitchStreams={twitchStreams} />
          )}
        </Grid.Col>
      </Grid>
      {currentStream && (
        <>
          <MediaQuery smallerThan="md" styles={{ display: "none" }}>
            <Group mt={10}>
              <IconCircle fill="red" color="red" size={10} />
              <Text fw={600}>{currentStream.user_name}</Text>
              <Text>{currentStream.viewer_count} viewers</Text>
            </Group>
          </MediaQuery>
          <MediaQuery smallerThan="md" styles={{ display: "none" }}>
            <Text>{currentStream.title}</Text>
          </MediaQuery>
        </>
      )}
    </Container>
  );
};

export default TwitchPanel;
