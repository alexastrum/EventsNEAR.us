<template>
  <q-page>
    <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
      <!-- WHAT IS -->
      <div>
        <h2 class="q-my-none fn-xxl fn-bold text-light">Who are we?</h2>
        <div class="text-white fn-md">
          <p>
            We love good music, great art, and the amazing feel of being part of
            a community. We hate scalpers and dislike box office fees.
            <!-- Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
            congue vel mi eget posuere. Sed semper tortor eu risus dignissim
            suscipit. Suspendisse commodo gravida aliquam. Cras sodales dui ut
            risus sodales, non finibus felis volutpat. Nam vel ornare dui. Nulla
            sit amet odio vehicula, imperdiet quam in, aliquam erat. Quisque sem
            mi, semper et mi nec, efficitur ultricies sem. Vivamus ullamcorper
            lectus et orci ultrices sodales. Vestibulum in orci vitae elit
            ultrices tempor et at eros. Suspendisse consequat quam sit amet dui
            faucibus, vitae auctor felis dictum. -->
          </p>
          <p>
            We beliene the blockchain can make value exchange faster and more
            universally accessible. It's already disrupted venture capital,
            wealth storage, and supply chain management. Collectible art and
            royalty business disruption happened just last year. We believe
            ticketing will be next.
            <!-- Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
            congue vel mi eget posuere. Sed semper tortor eu risus dignissim
            suscipit. Suspendisse commodo gravida aliquam. Cras sodales dui ut
            risus sodales, non finibus felis volutpat. Nam vel ornare dui. Nulla
            sit amet odio vehicula, imperdiet quam in, aliquam erat. Quisque sem
            mi, semper et mi nec, efficitur ultricies sem. Vivamus ullamcorper
            lectus et orci ultrices sodales. Vestibulum in orci vitae elit
            ultrices tempor et at eros. Suspendisse consequat quam sit amet dui
            faucibus, vitae auctor felis dictum. -->
          </p>
          <h2 class="q-my-none fn-xl fn-bold text-light">
            What are we building?
          </h2>
          <p>
            Alex had the idea for a fair community event marketplace since last
            year. He recently discovered that NEAR elegantly solves most of the
            limitations he saw in other blockchains that were preventing the
            implementation of a user-friendly, realtime, affordable, time-based
            ticketing system, he quickly jumped on board and called a few
            friends.
          </p>
          <p>
            You're looking at a proof-of-concept implementation of such a
            platform.
          </p>
          <ul></ul>
        </div>
      </div>
      <!-- HOW IT WORKS -->
      <h2 class="q-my-none fn-xxl fn-bold text-light">Why join us?</h2>
      <div>
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <!-- <q-skeleton dark height="350px" /> -->
            <h3 class="q-my-none fn-xl fn-bold text-light">Event hosts</h3>
            <div class="text-white fn-md q-mt-md">
              <ul>
                <li>
                  No platform fees for charitable and small events. You keep all
                  the NEAR from your ticket sale (excluding gas).
                </li>
                <li>
                  Community-focused, and transparent. With built-in secondary
                  market and tools to prevent sale timing attacks, scalping,
                  ticket cloning, and other acts of bad faith so common on other
                  platforms.
                </li>
                <li>
                  Subgraph for your data analytics platform, while respecting
                  your guests' privacy by only providing fully transparent
                  blockchain data through <b>The Graph</b>.
                </li>
                <li>
                  Your tickets are veritable <b>NEP-171 NFT</b> collectibles.
                  Thanks to resilient forever metadata and media storage powered
                  by <b>Crust</b>, your fans continue having access to them even
                  if eventsnear.us were to one day become inactive.
                </li>
                <li>
                  <b>Mintbase</b> integration for additional collectible drops.
                </li>
              </ul>
              <h4 class="q-my-none fn-lg fn-bold text-light">
                Future plans, should we get funded
              </h4>
              <ul>
                <li>Up to 30% of fees returned though token air drops.</li>
                <li>
                  Up to 30% of fees distributed in form of grants to you (the
                  event organizers), as voted by ticket holders.
                </li>
                <li>Up to 40% of fees distributed to token holders.</li>
                <li>
                  When holding our tokens, you can participate in the platform
                  governanace process.
                </li>
              </ul>
            </div>
          </div>
          <div class="col-6 column">
            <div class="col">
              <div>
                <h3 class="q-my-none fn-xl fn-bold text-light">
                  Everyone else
                </h3>
                <div class="text-white fn-md q-mt-md">
                  <ul>
                    <li>
                      We're making it easy to buy and sell at face value and
                      commision-free. No more scalping, ever!
                    </li>
                    <li>
                      Our ticket QR codes change every minute and can only be
                      generated by your very own wallet. When you buy a ticket
                      from someone, even on the day of the event, rest assured
                      that you and the event host will know in realtime whether
                      a ticket is real or not!
                    </li>
                    <li>
                      We also make it easy to gift tickets to your friends,
                      while keeping everything transparent and fair to everyone.
                    </li>
                    <li>
                      For sold-out events we offer waiting lists with
                      cryptographically secured
                      <b>lottery ticket</b> assignment. So no need to rush in
                      the middle of the night, crashing your favourite
                      promoter's servers, trying to try to grab that 1 in 10
                      spot. If it's ment to be, the world will provide.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
// .section {
//   height: 200px;
// }
</style>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return;
  },
});
</script>
