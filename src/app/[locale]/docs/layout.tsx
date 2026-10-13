// src/app/[locale]/docs/layout.tsx
'use client';

import React from 'react';
import { allDocs } from 'contentlayer/generated';
import SearchDialog from '@/components/search-dialog';
import { sidebarNav } from 'config/sidebar';
import Image from 'next/image';
import {
  SidebarProvider,
  SidebarLayout,
  MainContent,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeaderLogo,
  NestedLink,
} from '@/components/sidebar';
import { Github } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Header from '@/components/header';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { VersionSwitcher } from '@/components/version-switcher';
import { LocaleSwitcher } from '@/components/locale-switcher';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Destructure sidebarNav from configDocs
  const router = useRouter();
  const isMobile = useIsMobile();
  return (
    <SidebarLayout>
      {/* Left Sidebar Provider */}
      <SidebarProvider
        defaultOpen={isMobile ? false : true}
        defaultSide="left"
        defaultMaxWidth={280}
        showIconsOnCollapse={true}
      >
        <Sidebar>
          <SidebarHeader>
            <SidebarHeaderLogo
              className="w-auto h-auto"
              logo={
                <Image
                  alt="Nextellar Documentation Logo Light"
                  className={' w-44  object-contain dark:hidden'}
                  width={188}
                  height={100}
                  src={`/logos/logo-with-text-light.png`}
                />
              }
            />
            <SidebarHeaderLogo
              className="w-auto h-auto"
              logo={
                <Image
                  alt="Nextellar Documentation Logo Dark"
                  className={' w-44  hidden object-contain dark:block'}
                  width={188}
                  height={100}
                  src={`/logos/logo-with-text-dark.png`}
                />
              }
            />
          </SidebarHeader>
          <SidebarContent>
            {sidebarNav.map((section) => (
              <SidebarMenuItem
                isCollapsable={section.pages && section.pages.length > 0}
                key={section.title}
                label={section.title}
                href={section.href}
                icon={section.icon}
                defaultOpen={section.defaultOpen}
              >
                {section.pages?.map((page) => (
                  <NestedLink key={page.href} href={page.href}>
                    {page.title}
                  </NestedLink>
                ))}
              </SidebarMenuItem>
            ))}
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <MainContent>
          <Header className="justify-between py-2 gap-2">
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <SidebarTrigger />
              <h1 className="text-lg md:text-xl font-bold hidden sm:block">
                Documentation
              </h1>
            </div>
            <div className="flex gap-1 md:gap-2 items-center shrink-0">
              <LocaleSwitcher />
              <VersionSwitcher />
              <SearchDialog searchData={allDocs} />
              <ModeToggle />
              <Button
                onClick={() =>
                  router.push('https://github.com/nextellarlabs/nextellar')
                }
              >
                <Github className="h-[1.2rem] w-[1.2rem] transition-all" />
              </Button>
            </div>
          </Header>
          <main className="overflow-auto p-6">{children}</main>
        </MainContent>
      </SidebarProvider>
    </SidebarLayout>
  );
}
