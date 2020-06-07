import React, {useState} from 'react';
import { useSelector } from 'react-redux';
import { selectClarificationData } from '../../model/clarificationDataSlice';
import Table from 'react-bootstrap/Table';

const sw = require('stopword')

export function Similarity(props) {
  const setCurrentlyFocusedThreadID = props.setCurrentlyFocusedThreadID;

  const queryTitle = props.title;
  const clarificationData = useSelector(selectClarificationData);

  let query = sw.removeStopwords(queryTitle.toLowerCase().split(' '));

  let threads = Object.entries(clarificationData.threads).map(([threadID, thread]) => {
    if (thread.title === queryTitle) return [threadID, []];
    return [threadID, sw.removeStopwords(thread.title.toLowerCase().split(' '))]
  }).map(([threadID, threadWords]) => {
    return [threadID, query.filter(value => -1 !== threadWords.indexOf(value)).length]
  });

  let mostSimilar = threads.sort(([threadID1, count1], [threadID2, count2]) => {
    return -(count1 - count2); // Sort DESC
  });
  let ans = [];
  for (let entry of mostSimilar) {
    if (entry[1] === 0) break;
    if (ans.length > 5) break;
    ans.push(entry[0]);
  }
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th className="expand">Title</th>
          <th className="shrink">Answer</th>
          <th className="shrink">Contestant</th>
        </tr>
      </thead>
      <tbody>
        {
          ans.map(threadID => {
            return <tr><td className="expand"><a href="#" onClick={e => setCurrentlyFocusedThreadID(threadID)}>{clarificationData.threads[threadID].title}</a></td><td className="shrink">{clarificationData.threads[threadID].answer}</td><td className="shrink">{clarificationData.threads[threadID].senderid}</td></tr>
          })
        }
      </tbody>
    </Table>
  )
}