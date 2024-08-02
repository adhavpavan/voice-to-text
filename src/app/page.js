'use client';
// import 'antd/dist/antd.css';

import Image from 'next/image';
import styles from './page.module.css';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, Input, Spin, Space } from 'antd';
import axios from 'axios';
// const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
const { TextArea } = Input;
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from 'antd';
const { Search } = Input;
import { Button } from 'antd';
import LogoEditor from './LogoEditor';
import Test from './Test';
import { Rnd } from 'react-rnd';
import { testFullResponse } from './test2';
export default function Home() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [sortColumn, setSortColumn] = useState('name');
  const recognitionRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const [inputSpeechText, setInputSpeechText] = useState('');


  useEffect(() => {
    console.log(
      '-======== medicineOrders prescriptions changes===============',
      prescriptions
    );
  }, [prescriptions]);

  const convertTextToOrder = async () => {
    console.log('Started converting text to order for text: ', inputSpeechText);
    if (inputSpeechText) {
      const prompt = `Convert the following text to a structured order format: "${inputSpeechText}"`;

      let p = `
      You are an agent who needs to collect orders of different medicines from a medical store. For each medicine, gather the following information:

Medicine Name (Stock Keeping Unit)
Quantity
Content (the active ingredients or description of the medicine)
Once you have collected this information for all the medicines, store the details in a JavaScript array. Each entry in the array should be an object with the properties: medicineName, quantity, and content, id. create random generated string as id
Here is the format you should use for the JavaScript array:

const medicineOrders = [
    {
        medicineName: "Paracetamol",
        id:"yigsdy6856dsd6c",
        quantity: 10,
        content: "500mg"
    },
    {
        medicineName: "Ibuprofen",
        quantity: 5,
        id:"drfgiutwebe",
        content: "200mg"
    }
];

Make sure to provide accurate and complete information for each medicine.
Please return the data in the JSON format as shown above.
Order Details:${inputSpeechText}
`;
// if sample input like "Paracetamol 100mg 300 stripes 500mg 20 stripes 650mg 77 stripes", its should create three entries as its mentioned 3 different content type.
      if(!inputSpeechText){
        return
      }
      try {
        setIsLoading(true);
        // const r = await axios.post('https://api-inference.huggingface.co/models/llama3.1', {
         const r = await axios.post('http://localhost:3002/chat', {
          model: 'llama3.1',
          stream: false,
          // messages: [{ role: 'user', content: p }],
          message: p,
        });
        // let r = await testFullResponse(p)
        setIsLoading(false);

        console.log('------response --------999999----------', r);
        try {
          let inputString = r?.data?.payload;
          console.log('------inputString----------', inputString);

          const jsonPattern = /const medicineOrders = (\[.*?\]);/s;
          const jsonMatch = inputString.match(jsonPattern);

          if (!jsonMatch || jsonMatch.length < 2) {
            throw new Error(
              'medicineOrders data not found in the input string'
            );
          }

          const jsonString = jsonMatch[1];

          // console.log("--------jsonMatch-------------", jsonMatch)
          console.log(
            '--------jsonString-------------',
            typeof jsonString,
            jsonString,
            jsonString.replace('\r', '').replace('\n', '')
          );
          console.log(
            '--------jsonString988998-------------',
            jsonString.toString()
          );

          // Step 2: Parse the extracted JSON string
          let medicineOrders;
          try {
            // medicineOrders =JSON.parse(jsonString.replace('\r', '').replace('\n', ''))
            let d = jsonString.toString();
            medicineOrders = d.replace(/\\n/g, '').replace(/(\w+):/g, '"$1":');
            console.log(
              '-------medicineOrders----before------',
              typeof medicineOrders,
              medicineOrders
            );
            let data = JSON.parse(medicineOrders);
            console.log(
              '-------medicineOrders-----after-----',
              typeof data,
              data
            );
            console.log("--------aa--------", data)
            setPrescriptions([...data]);
          } catch (error) {
            setIsLoading(false);
            console.error('Error parsing JSON:', error);
            return null;
          }
        } catch (error) {
          setIsLoading(false);
          console.log('-----medicineOrders Error----------------', error);
        }
      } catch (error) {
        console.log('-----------error occurred---------', error);
      }
    }
  };
  useEffect(() => {
    // Check if browser supports the Web Speech API
    if (!('webkitSpeechRecognition' in window)) {
      alert('Sorry, your browser does not support the Web Speech API.');
      return;
    }

    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    let finalTranscript = '';
    recognition.onresult = (event) => {
      let interimTranscript = '';


      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setInputSpeechText(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognition.stop();
    };
  }, []);

  const handleStartListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    convertTextToOrder();
  };

  const startRecording = () => {
    setTranscript('This is a sample transcribed text.');
  };
  const stopRecording = () => {};

  const handleFilter = (e) => {
    setFilterText(e.target.value);
  };

  const columns = [
    {
      title: 'Medicine Name',
      dataIndex: 'medicineName',
      key: 'medicineName',
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => <Button type={'primary'}>Create Order</Button>,
    },
  ];

  // const [value, setValue] = useState('');

  const handleChange = (e) => {
    setInputSpeechText(e.target.value);
  };

  return (
    <main>

      <div className='container mx-auto flex flex-col items-center  justify-center h-screen px-4 md:px-6'>
        <div className='grid grid-cols-1 gap-8 w-full max-w-2xl'>
          <div className='flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900'>
            <div
              style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Card style={{ width: '800px' }}>
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex items-center'>
                    <MicIcon className='h-6 w-6 text-gray-500 mr-2' />
                    <h2 className='text-lg font-medium text-gray-800 dark:text-gray-200'>
                      AI Medicine Assistant
                    </h2>
                  </div>
                  <Card>
                    <Space>
                      <Button
                        type='primary'
                        variant='outline'
                        className='px-4 py-2 text-sm font-medium'
                        onClick={() => handleStartListening()}
                      >
                        Start Recording
                      </Button>
                      <Button
                        type='primary'
                        variant='outline'
                        className='px-4 py-2 text-sm font-medium'
                        onClick={() => handleStopListening()}
                      >
                        Stop Recording
                      </Button>
                    </Space>
                  </Card>
                </div>
                <div className='bg-gray-100 dark:bg-gray-700 rounded-md p-4 h-40 overflow-y-auto'>
                  <TextArea
                    rows={10}
                    value={inputSpeechText}
                    onChange={handleChange}
                    // contentEditable={true}
                    // readOnly
                    placeholder='Converted text will appear here'
                  />
                </div>
              </Card>
            </div>
            <div
              style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Card style={{ width: '800px' }}>
                <h2 className='text-2xl font-bold mb-4'>Prescription List</h2>
                <div className='mb-4'>
                  {/* <Input
                    type='text'
                    placeholder='Filter by medication name'
                    value={filterText}
                    onChange={handleFilter}
                    className='bg-gray-100 dark:bg-gray-800 dark:text-white rounded-lg p-2 w-full focus:outline-none'
                  /> */}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {isLoading ? (
                    <Spin />
                  ) : (
                    <Table
                      dataSource={prescriptions}
                      columns={columns}
                      rowKey='id'
                    />
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DiscIcon(props) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='12' cy='12' r='10' />
      <circle cx='12' cy='12' r='2' />
    </svg>
  );
}

function MicIcon(props) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z' />
      <path d='M19 10v2a7 7 0 0 1-14 0v-2' />
      <line x1='12' x2='12' y1='19' y2='22' />
    </svg>
  );
}
