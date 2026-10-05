import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { tones } from "../tones";
import { Illustration } from "./illustration";

const meta = {
  title: "Примитивы/Illustration",
  component: Illustration,
  tags: ["autodocs"],
  args: {
    src: "/images/app/mascot-wave.webp",
    alt: "Маскот машет рукой",
    width: 320,
    height: 320,
    tone: "ink",
  },
  argTypes: { tone: { control: "select", options: tones } },
  parameters: {
    docs: {
      description: {
        component:
          "Картинка с заглушкой: пока файла нет, показывается плашка с именем файла. Сгенерированные картинки кладём в public/images/app/ — они подхватятся без правок кода.",
      },
    },
  },
  decorators: [(Story) => <div className="w-64"><Story /></div>],
} satisfies Meta<typeof Illustration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { name: "Песочница" };
