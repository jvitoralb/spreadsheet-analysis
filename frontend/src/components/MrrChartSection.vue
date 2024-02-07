<template>
    <section id="mrr-section">
        <h3 id="mrr-section-header">
            <a @click="handleChartDisplay">Visualisar MRR</a>
        </h3>

        <section v-show="displayChart" id="mrr-chart-section">
            <h3 id="mrr-chart-section-header">Monthly Recurring Revenue</h3>

            <svg id="mrr-chart-container"></svg>
            
            <ul id="mrr-chart-years-list" class="pb-3 d-flex d-inline-flex list-group">
                <li v-for="(item, index) in mrrData" :key="index" id="mrr-list-item" class="pe-4 list-group-item d-flex flex-row-reverse justify-content-evenly">
                    {{ item.ano }}
                </li>
            </ul>
        </section>
    </section>
</template>

<script>
import { useStore } from 'vuex';
import { computed } from 'vue';
import * as d3 from 'd3';

export default {
    setup() {
        const store = useStore();
        const mrrData = computed(() => store.getters.getMrr);

        return {
            mrrData,
        }
    },
    data() {
        return {
            displayChart: false,
            chartStatus: 0,
            years: [],
            values: [],
            selectedData: [],
            chart: null,
            xAxis: null,
            yAxis: null,
            xG: null,
            yG: null,
            xScale: null,
            yScale: null,
            CHART_WIDTH: 600,
            CHART_HEIGHT: 400,
            CHART_PADDING: 60,
        }
    },
    methods: {
        handleChartDisplay() {
            if (this.displayChart) {
                this.displayChart = false;
                return;
            }
            if (this.chartStatus === 0) {
                this.buildChart();
                this.chartStatus = 1;
            }
            this.displayChart = true;
        },
        setValuesAndYears() {
            this.years = this.selectedData.map((item) => item.ano);
            this.values = this.selectedData.map((item) => 
                item.mrr.reduce((sum, currVal) => 
                    sum + Number(currVal.valor.toFixed(2)
                ), 0)
            );
        },
        setAxis() {
            this.xAxis = d3.axisBottom(this.xScale).tickSizeOuter(0);
            this.yAxis = d3.axisLeft(this.yScale).tickSizeOuter(0);
        },
        setGs() {
            this.xG = this.chart.append('g')
            .call(this.xAxis)
            .attr('transform', `translate(${this.CHART_PADDING}, ${this.CHART_HEIGHT})`)
            .attr('id', 'x-axis');

            this.yG = this.chart.append('g')
            .call(this.yAxis)
            .attr('transform', `translate(${this.CHART_PADDING}, 0)`)
            .attr('id', 'y-axis');
        },
        setScales() {
            this.xScale = d3.scaleBand()
            .rangeRound([0, this.CHART_WIDTH])
            .padding(0.1);

            this.yScale = d3.scaleLinear()
            .range([this.CHART_HEIGHT, 0 + (this.CHART_PADDING * 0.5)]);
        },
        defineScalesDomain() {
            this.xScale.domain(this.years);
            this.yScale.domain([0, d3.max(this.values)]);
        },
        renderBarsAndLabels() {
            this.chart.selectAll('.bar')
            .data(this.selectedData, (data) => data.ano)
            .enter()
            .append('rect')
            .classed('bar', true)
            .attr('width', this.xScale.bandwidth())
            .attr('height', (d, idx) => (this.CHART_HEIGHT - this.yScale(this.values[idx])))
            .attr('x', (d, idx) => (this.xScale(this.years[idx]) + this.CHART_PADDING))
            .attr('y', (d, idx) => this.yScale(this.values[idx]));

            this.chart.selectAll('.label')
            .data(this.selectedData, (data) => data.ano)
            .enter()
            .append('text')
            .classed('label', true)
            .text((d, idx) => this.values[idx])
            .attr('x', (d, idx) => (this.xScale(this.years[idx]) + this.CHART_PADDING) + (this.xScale.bandwidth() / 2))
            .attr('y', (d, idx) => (this.yScale(this.values[idx]) - (this.CHART_PADDING / 5)))
            .attr('text-anchor', 'middle');
        },
        buildChart() {
            this.selectedData = this.mrrData;

            this.setScales();
            
            const chartContainer = d3.select('#mrr-chart-container')
            .attr('height', this.CHART_HEIGHT + this.CHART_PADDING)
            .attr('width', this.CHART_WIDTH + (this.CHART_PADDING * 2));

            this.chart = chartContainer.append('g');

            this.setValuesAndYears();
            this.defineScalesDomain();
            this.setAxis();
            this.setGs();

            this.renderBarsAndLabels();

            const listItems = d3.selectAll('#mrr-list-item')
            .data(this.selectedData.map((item) => item.ano));

            let unselectedYears = [];

            listItems.append('input')
            .classed('mx-2 form-check-input', true)
            .attr('type', 'checkbox')
            .attr('id', (data) => `MRR${data}`)
            .attr('checked', true)
            .on('change', (data) => {
                let year = data.target.id;

                if (unselectedYears.includes(year)) {
                    unselectedYears = unselectedYears.filter((y) => y !== year);
                } else {
                    unselectedYears.push(year);
                }
                this.selectedData = this.mrrData.filter((dt) => {
                    return unselectedYears.indexOf(`MRR${dt.ano}`) === -1
                });
                this.updateChart();
            });
        },
        updateChart() {
            this.setValuesAndYears();
            this.defineScalesDomain();

            this.xG.transition()
            .call(this.xAxis);

            this.yG.transition()
            .call(this.yAxis);

            this.chart.selectAll('.bar')
            .data(this.selectedData, (data) => data.ano)
            .attr('width', this.xScale.bandwidth())
            .attr('height', (d, idx) => (this.CHART_HEIGHT - this.yScale(this.values[idx])))
            .attr('x', (d, idx) => (this.xScale(this.years[idx]) + this.CHART_PADDING))
            .attr('y', (d, idx) => this.yScale(this.values[idx]))
            .exit()
            .remove();

            this.chart.selectAll('.label')
            .data(this.selectedData, (data) => data.ano)
            .text((d, idx) => this.values[idx])
            .attr('x', (d, idx) => (this.xScale(this.years[idx]) + this.CHART_PADDING) + (this.xScale.bandwidth() / 2))
            .attr('y', (d, idx) => (this.yScale(this.values[idx]) - (this.CHART_PADDING / 5)))
            .exit()
            .remove();

            this.renderBarsAndLabels();
        },
    }
}
</script>