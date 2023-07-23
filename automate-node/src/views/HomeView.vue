<template>
  <div class="bg-grey-lighten-2 full-width pa-10">
    <div class="d-flex align-center">
		<div><v-img :src="logo" width="250" /></div>
		<div class="ml-5">Contacts Normally Closed <br /> App Version {{  version }}</div>
	</div>
	<table class="my-5" width="100%">
		<tr>
			<td width="10%" class="pa-1 text-body-2 font-weight-bold">Serial Number</td>
			<td width="10%" class="pa-1 text-body-2 font-weight-bold">Server Version</td>
			<td width="10%" class="pa-1 text-body-2 font-weight-bold">Used Memory</td>
			<td width="10%" class="pa-1 text-body-2 font-weight-bold">Used Disk</td>
			<td width="10%" class="pa-1 text-body-2 font-weight-bold">Used CPU</td>
			<td width="10%" class="pa-1 text-body-2 font-weight-bold">IP Address</td>
			<td width="10%" class="pa-1 text-body-2 font-weight-bold">MAC Address</td>
			<td width="10%" class="pa-1 text-body-2 font-weight-bold">Updated</td>
		</tr>
		<tr>
			<td class="px-1 text-body-2">{{ systemInfo.serial_number }}</td>
			<td class="px-1 text-body-2">{{ systemInfo.version }}</td>
			<td class="px-1 text-body-2">{{ (systemInfo.used_memory / (1024 ** 3)).toFixed(2) }} / {{ (systemInfo.total_memory / (1024 ** 3)).toFixed(2) }} GB ({{ systemInfo.memory_percent }} %)</td>
			<td class="px-1 text-body-2">{{ (systemInfo.used_disk / (1024 ** 3)).toFixed(2) }} / {{ (systemInfo.total_disk / (1024 ** 3)).toFixed(2) }} GB ({{ systemInfo.disk_percent }} %)</td>
			<td class="px-1 text-body-2">{{ systemInfo.cpu_percent }}%</td>
			<td class="px-1 text-body-2">{{ systemInfo.ip_address }}</td>
			<td class="px-1 text-body-2">{{ systemInfo.mac_address }}</td>
			<td class="px-1 text-body-2">{{ dayjs(systemInfo.timestamp, 'x').format('DD-MMM-YYYY | HH:mm:ss') }}</td>
			
			
			
		</tr>
	</table>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, 600px); grid-gap: 20px">
		<div class="bg-white rounded-lg pa-5" v-for="index in 7" :key="index">
			<div class="" style="display: grid; grid-template-columns: 1fr 1fr 1fr; grid-gap: 5px">
				<div class="text-h3 bg-grey-lighten-2 text-right pa-2 rounded-lg">
					{{ parseInt(load[`S${index}`]) }}<br /><span class="text-h6">{{ load.unit }}</span>
				</div>
				<div class="bg-grey-lighten-2 d-flex align-center justify-center pa-2 rounded-lg">
					<!-- {{ relays[index] }} -->
					<v-icon
					:class="relays[index] ? 'text-green' : 'text-red'"
					:icon="relays[index] ? 'mdi-power-plug' : 'mdi-power-plug-off'"
					class="text-h1"
					></v-icon>
				</div>
				<div class="text-h3 bg-grey-lighten-2 text-right pa-2 rounded-lg">
					{{ parseFloat(usage[`S${index}`]).toFixed(2) }}<br /><span class="text-h6">{{ usage.unit }}</span><br />
					<span class="text-caption">{{ parseFloat(usage[`S${index}`]).toFixed(6) }}</span>
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
					Switch {{ relays[index] ? 'Off':'On' }} - S{{ index }}
				</v-btn>
			</div>
		</div>
    </div>
	<div class="my-6"><v-btn color="red" @click="resetMetersDialog = true"><span class="font-weight-bold">Reset Meters to 0</span></v-btn></div>
	<v-dialog v-model="resetMetersDialog" max-width="500">
		<v-card class="pa-10">
			<h1>Are you sure ?</h1>
			<h5 class="red--text">This action cannot be reversed.</h5><br />
			<v-row>
				<v-col>
					<v-btn @click="resetMetersDialog = false" block color="grey">Cancel</v-btn>
				</v-col>
				<v-col>
					<v-btn @click="resetMeters()" block color="red">Reset</v-btn>
				</v-col>
			</v-row>
		</v-card>

	</v-dialog>
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
import { version } from '../../package.json'
// import TheWelcome from '../components/TheWelcome.vue'
import logo from '@/assets/logo.png'
console.log(logo)

export default {
  data: () => ({
    message: 'hello',
	resetMetersDialog: false,
    logo: logo,
	systemInfo: {
		version: "",
		ipAddress: "",
		serial_number: "",
		total_memory: 0,
		available_memory: 0,
		used_memory: 0,
		free_memory: 0,
		memory_percent: 0,
		memory_unit: "",
		total_disk: 0,
		used_disk: 0,
		free_disk: 0,
		disk_percent: 0,
		disk_unit: "",
		cpu_percent: 0,
		cpu_unit: "",
		ip_address: "",
		mac_address: "",
		timestamp: 0
	},
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
  computed: {
	version() {
	  return version
	}
  },
  methods: {
    async getLoad() {
      let loadResult = await this.axios.get('/api/v1/load')
      this.load = loadResult.data.data.data
    },
	async getSystemInfo() {
		let systemInfoResult = await this.axios.get('/api/v1/systemInfo');
		this.systemInfo = systemInfoResult.data.data.data
		// console.log(JSON.stringify(systemInfoResult.data.data.data, null, 2))
	},
    async getUsage() {
      let usageResult = await this.axios.get('/api/v1/usage')
      this.usage = usageResult.data.data.data
    },
	async getAutomation() {
		let automationResult = await this.axios.get('/api/v1/mqttservice');
		console.log('automationResult = ', automationResult)
	},
    toggleRelay(relay) {
      this.relays[relay] = !this.relays[relay]
      let value = this.relays[relay] ? 0 : 1
      this.axios.get(`/api/v1/write/${relay}/${value}`)
    },
    toggleAllRelays() {
      this.allRelays = !this.allRelays
      for (let i = 1; i <= 7; i++) {
        this.relays[i] = this.allRelays
      }
      this.axios.get(`/api/v1/write/all/${this.allRelays ? 0 : 1}`)
    },
	async getRelayState() {
		let relay1 = await this.axios.get('/api/v1/read/1');
		if (relay1.data.data == 'off') {
			this.relays[1] = true;
		} else {
			this.relays[1] = false;
		}
		let relay2 = await this.axios.get('/api/v1/read/2');
		if (relay2.data.data == 'off') {
			this.relays[2] = true;
		} else {
			this.relays[2] = false;
		}
		let relay3 = await this.axios.get('/api/v1/read/3');
		if (relay3.data.data == 'off') {
			this.relays[3] = true;
		} else {
			this.relays[3] = false;
		}
		let relay4 = await this.axios.get('/api/v1/read/4');
		if (relay4.data.data == 'off') {
			this.relays[4] = true;
		} else {
			this.relays[4] = false;
		}
		let relay5 = await this.axios.get('/api/v1/read/5');
		if (relay5.data.data == 'off') {
			this.relays[5] = true;
		} else {
			this.relays[5] = false;
		}
		let relay6 = await this.axios.get('/api/v1/read/6');
		if (relay6.data.data == 'off') {
			this.relays[6] = true;
		} else {
			this.relays[6] = false;
		}
		let relay7 = await this.axios.get('/api/v1/read/7');
		if (relay7.data.data == 'off') {
			this.relays[7] = true;
		} else {
			this.relays[7] = false;
		}
	},
	async resetMeters() {
		this.resetMetersDialog = false;
		let usage = {
					S1: 0,
					S2: 0,
					S3: 0,
					S4: 0,
					S5: 0,
					S6: 0,
					S7: 0,
					total: 0,
					unit: 'kWh',
					timestamp: this.dayjs().valueOf()
		}
		let powerSum =  {
					S1: 0,
					S2: 0,
					S3: 0,
					S4: 0,
					S5: 0,
					S6: 0,
					S7: 0,
					total: 0,
					unit: 'W',
					timestamp: this.dayjs().valueOf()
		}
		let load = {
					S1: 0,
					S2: 0,
					S3: 0,
					S4: 0,
					S5: 0,
					S6: 0,
					S7: 0,
					total: 0,
					unit: 'W',
					timestamp: this.dayjs().valueOf()
		}
		// console.log('usage = ', JSON.stringify(usage, null, 2))	
		await this.axios.post('/api/v1/usage', usage);
		await this.axios.post('/api/v1/powersum', powerSum);
		await this.axios.post('/api/v1/load', load);
		await this.axios.post('/api/v1/reset');
		// console.log('resetResult = ', resetResult)
	}
  },
  created() {
	this.getRelayState();
    this.getLoad();
	this.getUsage();
	this.getAutomation();
	this.getSystemInfo();
    setInterval(() => {
      this.getLoad()
	  this.getUsage()
	  this.getSystemInfo();
    }, 1000)
  }
}
</script>
