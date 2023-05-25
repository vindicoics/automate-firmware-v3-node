<template>
  <div class="bg-grey-lighten-2 full-width pa-10">
    <v-img :src="logo" width="250" />

    <div style="display: grid; grid-template-columns: repeat(auto-fill, 600px); grid-gap: 20px">
      <div class="bg-white rounded-lg pa-5" v-for="index in 7" :key="index">
        <div class="" style="display: grid; grid-template-columns: 1fr 1fr 1fr; grid-gap: 5px">
          <div class="text-h3 bg-grey-lighten-2 text-right pa-2 rounded-lg">
            {{ parseInt(load[`S${index}`]) }}<br /><span class="text-h6">{{ load.unit }}</span>
          </div>
          <div class="bg-grey-lighten-2 d-flex align-center justify-center pa-2 rounded-lg">
            <v-icon
              :class="relays[index] ? 'text-green' : 'text-red'"
              :icon="relays[index] ? 'mdi-power-plug' : 'mdi-power-plug-off'"
              class="text-h1"
            ></v-icon>
          </div>
          <div class="text-h3 bg-grey-lighten-2 text-right pa-2 rounded-lg">
            {{ parseFloat(usage[`S${index}`]).toFixed(2) }}<br /><span class="text-h6">{{ usage.unit }}</span>
          </div>
        </div>
		  <div class="">Updated: {{ dayjs(load.timestamp, 'x').format('DD-MMM-YYYY | HH:mm:ss')}}</div>
        <!-- <div class="text-h6">S{{ index }} Load</div> -->
        <div>
          <v-btn
            :key="index"
            @click="toggleRelay(index)"
            block
            variant="outlined"
            flat
            size="x-large"
            class="bg-primary text-white mt-2"
            >
			<!-- <v-icon
              :class="relays[index] ? 'text-green' : 'text-red'"
              :icon="relays[index] ? 'mdi-check-circle' : 'mdi-minus-circle'"
              class="mr-2 text-h5"
            ></v-icon> -->
            Switch {{ relays[index] ? 'Off':'On' }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- <br /><br />
    {{ usage }} -->
    <!-- <v-btn @click="toggleAllRelays()" block size="large" class="bg-primary text-white mt-2">
      All
    </v-btn>

    <v-btn
      v-for="(relay, index) in relays"
      :key="index"
      @click="toggleRelay(index)"
      block
      size="large"
      class="bg-primary text-white mt-2"
      ><v-icon
        :class="relays[index] ? 'text-green' : 'text-red'"
        :icon="relays[index] ? 'mdi-check-circle' : 'mdi-minus-circle'"
        class="mr-2 text-h5"
      ></v-icon>
      Relay {{ index }}
    </v-btn>
    <pre>{{ load }}</pre>
    <v-icon icon="mdi:mdi-home" /> -->
  </div>
</template>

<script>
// import TheWelcome from '../components/TheWelcome.vue'
import logo from '@/assets/logo.png'
console.log(logo)

export default {
  data: () => ({
    message: 'hello',
    logo: logo,
    allRelays: false,
    relays: {
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false
    },
    load: {
      S1: '0',
      S2: '0',
      S3: '0',
      S4: '0',
      S5: '0',
      S6: '0',
      S7: '0',
      unit: 'W',
      timestamp: 0
    },
    usage: {
      S1: '0',
      S2: '0',
      S3: '0',
      S4: '0',
      S5: '0',
      S6: '0',
      S7: '0',
      unit: 'KW',
      timestamp: 0
    }
  }),
  methods: {
    async getLoad() {
      let loadResult = await this.axios.get('http://localhost:3000/load')
      this.load = loadResult.data.data
    },
    async getUsage() {
      let usageResult = await this.axios.get('http://localhost:3000/usage')
      this.usage = usageResult.data.data
    },

    toggleRelay(relay) {
      this.relays[relay] = !this.relays[relay]
      let value = this.relays[relay] ? 1 : 0
      this.axios.get(`http://localhost:3000/write/${relay}/${value}`)
    },
    toggleAllRelays() {
      this.allRelays = !this.allRelays
      for (let i = 1; i <= 7; i++) {
        this.relays[i] = this.allRelays
      }
      this.axios.get(`http://localhost:3000/write/all/${this.allRelays ? 1 : 0}`)
    }
  },
  created() {
    this.getLoad()
	this.getUsage()
    setInterval(() => {
      this.getLoad()
	  this.getUsage()
    }, 1000)
  }
}
</script>
