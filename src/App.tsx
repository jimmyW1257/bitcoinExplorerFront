import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

interface Block {
    height: number;
    transaction_count: number;
    fee: number;
    tps: number;
    time: string;
}

interface MarketData {
    market_volume: number;
    timestamp: string;
    usd: number;
}

function App() {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [marketData, setMarketData] = useState<MarketData[]>([]);

    useEffect(() => {
        const fetchBlocks = async () => {
            const response = await fetch('http://82.180.163.150:4000/api/blocks');
            const data = await response.json();
            setBlocks(data);
        };

        const fetchMarketData = async () => {
            const response = await fetch('http://82.180.163.150:4000/api/market');
            const data = await response.json();
            setMarketData(data);
        };

        fetchBlocks();
        fetchMarketData();

        const intervalId = setInterval(() => {
            fetchBlocks();
            fetchMarketData();
        }, 30000); // 每30s更新一次数据

        return () => clearInterval(intervalId);
    }, []);

    // 将时间戳格式化为 UTC 的 YYYY-MM-DD HH:mm:ss 格式
    const formatUTCDate = (timestamp: string) => {
        // 检查传入的 timestamp 是否是数字，如果是，将其乘以 1000 以转换为毫秒
    const parsedTimestamp = typeof timestamp === 'number' ? timestamp * 1000 : Date.parse(timestamp);
    
    if (isNaN(parsedTimestamp)) {
        // 如果时间戳无效，返回一个错误提示或默认值
        return 'Invalid Date';
    }

    const date = new Date(parsedTimestamp);
    return date.toISOString().replace('T', ' ').replace('Z', '').split('.')[0];
    };

    const blockLabels = blocks.map(block => block.height);
    const transactionCountData = blocks.map(block => block.transaction_count);
    const minerFeeData = blocks.map(block => block.fee);
    const tpsData = blocks.map(block => block.tps);
    const marketVolumeData = marketData.map(data => data.market_volume);
    const priceData = marketData.map(data => data.usd);
    const timeData = marketData.map(data => formatUTCDate(data.timestamp));

    // 获取最新的区块信息
    const latestBlock = blocks[blocks.length-1];

    const blockChartData = {
        labels: blockLabels,
        datasets: [
            {
                label: 'Transaction Count',
                data: transactionCountData,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
            },
            {
                label: 'Miner Fee (BTC)',
                data: minerFeeData,
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false,
            },
            {
                label: 'TPS (Transactions per second)',
                data: tpsData,
                borderColor: 'rgba(54, 162, 235, 1)',
                fill: false,
            }
        ],
    };

    const marketChartData = {
        labels: timeData,
        datasets: [
            {
                label: 'Market Volume (USD)',
                data: marketVolumeData,
                borderColor: 'rgba(153, 102, 255, 1)',
                fill: false,
            },
            {
                label: 'Price (USD)',
                data: priceData,
                borderColor: 'rgba(212, 102, 155, 1)',
                fill: false,
            }
        ],
    };

return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>Bitcoin Explorer</h1>

        {latestBlock && (
            <div style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                transition: '0.3s',
            }}>
                <h2 style={{ margin: '0 0 10px', color: '#007bff' }}>Current Block: {latestBlock.height}</h2>
                <p><strong>Transaction Count:</strong> {latestBlock.transaction_count}</p>
                <p><strong>Miner Fee(MAX per KB):</strong> {latestBlock.fee/100000000} BTC</p>
                <p><strong>TPS:</strong> {latestBlock.tps}</p>
                <p><strong>Timestamp:</strong> {formatUTCDate(latestBlock.time)}</p>
            </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '48%' }}>
                <h2>On-chain Data</h2>
                <Line data={blockChartData} />
            </div>

            <div style={{ width: '48%' }}>
                <h2>Off-chain Data</h2>
                <Line data={marketChartData} />
            </div>
        </div>
    </div>
);

}

export default App;
