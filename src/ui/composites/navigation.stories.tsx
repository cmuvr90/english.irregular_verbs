import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { IconBell } from "../icons";
import { Avatar } from "../primitives/avatar";
import { IconButton } from "../primitives/icon-button";
import { tabs } from "./fixtures";
import { TabBar } from "./tab-bar";
import { TopBar } from "./top-bar";

const meta = {
  title: "Композиты/Навигация",
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="bg-aurora mx-auto w-full max-w-md rounded-2xl p-4"><Story /></div>],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tabs: Story = {
  name: "TabBar",
  render: function Render() {
    const [active, setActive] = useState("home");
    return (
      // Перехватываем клики по ссылкам, чтобы в витрине переключать вкладку без навигации.
      <div
        onClickCapture={(e) => {
          const a = (e.target as HTMLElement).closest("a");
          if (!a) return;
          e.preventDefault();
          setActive(a.getAttribute("href")!.slice(1));
        }}
      >
        <TabBar items={tabs} active={active} position="static" />
      </div>
    );
  },
};

export const Header: Story = {
  name: "TopBar",
  render: () => (
    <div className="flex flex-col gap-4">
      <TopBar
        position="static"
        hideOnScroll={false}
        title="Тренажёры"
        subtitle="6 способов выучить формы"
        back={{ href: "#back", label: "Назад" }}
      />
      <TopBar
        position="static"
        hideOnScroll={false}
        title="Irregular Verbs"
        actions={
          <>
            <IconButton icon={IconBell} label="Уведомления" badge={2} />
            <Avatar name="Eugene S" />
          </>
        }
      />
    </div>
  ),
};
