import React, {Component} from 'react';
import {render} from 'react-dom';
import {Header, Grid, Card, Button, Select, Modal, Icon, Form, Input, TextArea} from 'semantic-ui-react';
import fetch from 'isomorphic-fetch';

class Goals extends Component {
  constructor() {
    super()
    this.state = {
      goals: [],
      sort: 'Highest',
      newGoal: {},
      modalOpen: false
    }
  }

  componentWillMount() {
    this.pusher = new Pusher(window.pusherDetails.key, {
      cluster: window.pusherDetails.cluster,
      encrypted: true
    });
    this.goalsChannel = this.pusher.subscribe('goals');

    fetch('/api/goals', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'GET'
    }).then(response => {
      if(!response.ok) {
        return response.json().then(Promise.reject.bind(Promise))
      }
      return response.json()
    }).then(json => {
      this.setState({goals: json})
    }).catch(err => {
      console.log('Error happened', err);
    })
  }

  render() {
    return (
      <div>
        <Header as='h4' color='blue' block>Goals Tracker</Header>
        <Grid centered columns={2}>
          <Grid.Column>
            <Modal
              trigger={<Button onClick={this.handleOpen}>Add New Goal</Button>}
              open={this.state.modalOpen}
              onClose={this.handleClose}
            >
                <Header content='Add New Goal' />
                <Modal.Content>
                  <Form>
                    <Form.Group widths='equal'>
                      <Form.Field id='form-input-control-title' control={Input} label='Title' name='title' placeholder='title' onChange={this.handleChange}/>
                      <Form.Field id='form-input-control-email' control={Input} label='Email' name='email' placeholder='email' onChange={this.handleChange}/>
                    </Form.Group>
                    <Form.Group widths='equal'>
                      <Form.Field id='form-textarea-control-description' control={TextArea} label='Description' name='description' placeholder='description' onChange={this.handleChange}/>
                    </Form.Group>
                    <Form.Group widths='equal'>
                      <Form.Field control={Select} label='Priority' options={options} name='priority' placeholder='priority' onChange={this.handleChange}/>
                    </Form.Group>
                  </Form>
                </Modal.Content>
                <Modal.Actions>
                  <Button color='red' inverted onClick={this.handleClose}>
                    <Icon name='cancel' /> Cancel
                  </Button>
                  <Button color='green' inverted onClick={this.handleSubmit}>
                    <Icon name='checkmark' /> Create
                  </Button>
                </Modal.Actions>
              </Modal>
          </Grid.Column>
        </Grid>
        <Grid>
          <Grid.Column width={4}>
            Order By Priority:
            <Select style={{marginLeft: '10px'}}placeholder='Select Priority' options={[
                {
                  key: 'Highest',
                  value: 'Highest',
                  text: 'Highest'
                },
                {
                  key: 'Lowest',
                  value: 'Lowest',
                  text: 'Lowest'
                }
              ]} onChange={(e,data) => {this.changeOrderPriority(data)}}/>
          </Grid.Column>
          <Grid.Column stretched width={12}>
            <Card.Group>
              {this.state.goals.sort((a,b) => {
                if (this.state.sort === 'Highest') {
                  return b.priority - a.priority
                } else {
                  return a.priority - b.priority
                }
              }).map(goal => {
                return (
                  <Card fluid key={goal._id}>
                    <Card.Content>
                      <Card.Header>
                        {goal.title}
                      </Card.Header>
                      <Card.Meta>
                        {goal.email}
                      </Card.Meta>
                      <Card.Description>
                        {goal.description}
                      </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                      Priority: {goal.priority}
                    </Card.Content>
                    <Card.Content extra>
                      Posted: {moment(goal.createdAt).fromNow()}
                    </Card.Content>
                    <Card.Content extra>
                      <div className='ui two buttons'>
                        <Button basic color='green' disabled={goal.priority >= 5} onClick={() => {this.raisePriority(goal._id, goal.priority)}}>Raise Priority</Button>
                        <Button basic color='red' disabled={goal.priority <= 1} onClick={() => {this.decreasePriority(goal._id, goal.priority)}}>Decrease Priority</Button>
                      </div>
                    </Card.Content>
                  </Card>
                )
              })}
            </Card.Group>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

render(<Goals />, document.getElementById('app'));