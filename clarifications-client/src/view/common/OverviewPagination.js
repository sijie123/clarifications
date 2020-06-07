import Pagination from 'react-bootstrap/Pagination';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';



import React, { useState } from 'react';

export function OverviewPagination(props) {
    let threads = props.threads;
    let count = props.threads.length;
    let display = props.display;
    let [perPage, setPerPage] = useState(5); // Default 5 per page.
    let [answeredPage, setAnsweredPage] = useState(0);
    let pages = Math.ceil(count / perPage);
  
    let limit = (start) => (_, i) => {
      return i >= start && i < start + perPage;
    }
    let page = (page) => limit(page * perPage);
  
    return (
      <Card className="overviewGroup">
        <Card.Header>
          <h5 class="m-0" className="inline">Answered</h5>
        </Card.Header>
        {
          threads.filter(page(answeredPage)).map(display)
        }
        <Card.Footer>
          <Row>
            <Col>
            <InputGroup>
              <Form.Control as="select" custom value={perPage} onChange={e => setPerPage(e.target.value)}>
                <option value={0}>0 (Hide)</option>
                <option>2</option>
                <option>5</option>
                <option>10</option>
                <option>25</option>
              </Form.Control>
              <InputGroup.Append>
                <InputGroup.Text id="perpage">per page</InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
            </Col>
            <Col>
            <Pagination className={'justify-content-center'}>
            <Pagination.Item onClick={e => setAnsweredPage(0)} key={0} active={0 == answeredPage}>&#171; 1</Pagination.Item>
            {answeredPage >= 3 && pages >= 4 ? <Pagination.Item disabled>...</Pagination.Item> : ''}
            {answeredPage >= 2 ? <Pagination.Item onClick={e => setAnsweredPage(answeredPage - 1)} key={answeredPage - 1} active={false}>{answeredPage}</Pagination.Item> : ''}
            {answeredPage >= 1 && answeredPage < pages - 1 ? <Pagination.Item key={answeredPage} active={true}>{answeredPage + 1}</Pagination.Item> : ''}
            {answeredPage < pages - 2 ? <Pagination.Item onClick={e => setAnsweredPage(answeredPage + 1)} key={answeredPage + 1} active={false}>{answeredPage+2}</Pagination.Item> : ''}
            {answeredPage < pages - 3 && pages >= 4 ? <Pagination.Item disabled>...</Pagination.Item> : ''}
            <Pagination.Item onClick={e => setAnsweredPage(pages - 1)} key={pages - 1} active={pages - 1 == answeredPage}>{pages} &#187;</Pagination.Item>
          </Pagination>
            </Col>
  
          </Row>
          
          
        </Card.Footer>
      </Card>
    )
  }