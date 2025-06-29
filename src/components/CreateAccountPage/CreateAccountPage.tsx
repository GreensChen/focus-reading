import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './CreateAccountPage.css';

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await signUp(values.email, values.password);
      message.success('註冊成功');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      message.error('註冊失敗');
    }
  };

  return (
    <div className="create-account-container">

      <div className="create-account-box">
        <Form
          name="create_account"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="電子郵件"
            rules={[
              { required: true, message: '請輸入電子郵件' },
              { type: 'email', message: '請輸入有效的電子郵件' }
            ]}
          >
            <Input
              type="email"
              placeholder="請輸入電子郵件"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密碼"
            rules={[
              { required: true, message: '請輸入密碼' },
              { min: 6, message: '密碼長度至少為 6 個字符' }
            ]}
          >
            <Input.Password
              placeholder="請輸入密碼"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="確認密碼"
            dependencies={['password']}
            rules={[
              { required: true, message: '請確認密碼' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('兩次輸入的密碼不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="請再次輸入密碼"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              註 冊
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              type="link"
              onClick={() => navigate('/login')}
              block
            >
              返回登入
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreateAccountPage;
