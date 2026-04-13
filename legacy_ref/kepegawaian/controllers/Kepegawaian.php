<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Kepegawaian extends CI_Controller
{
    function __construct()
    {
        // Construct the parent class
        parent::__construct();
        is_logged_in();
        $this->load->model('model_karyawan');
        $this->load->model('data_param');
    }
    public function index()
    {
        $data['titel'] = 'Kepegawaian';
        $data['jml_karyawan'] = $this->db->query("select * from tmst_karyawan ")->num_rows();
        $data['laki'] = $this->db->query("select * from tmst_karyawan where jenis_kelamin='L' ")->num_rows();
        $data['perempuan'] = $this->db->query("select * from tmst_karyawan where jenis_kelamin='P' ")->num_rows();
        $data['s1'] = $this->db->query("select * from v_pendidkan_kar where id_pendidikan='4' ")->num_rows();
        $data['s2'] = $this->db->query("select * from v_pendidkan_kar where id_pendidikan='5' ")->num_rows();
        $data['sma'] = $this->db->query("select * from v_pendidkan_kar where  id_pendidikan!='5' And id_pendidikan!='4' ")->num_rows();
        $data['karyawan'] = $this->db->query("SELECT A.id_biro,B.jumlah FROM tmst_biro A LEFT JOIN (SELECT id_biro, count( * ) AS jumlah FROM riwayat_jabatan GROUP BY id_biro) B ON A.id_biro = B.id_biro ")->result();
        $this->load->view('page_index', $data);
    }
    public function karyawan()
    {
        $data['titel'] = 'Data Karyawan';
        $data['karyawan'] = $this->model_karyawan->get_karyawan();
        $this->load->view('page_karyawan', $data);
    }
    public function karyawan_detil($nik)
    {
        $data['titel'] = 'Data Karyawan';
        $data['karyawan'] = $this->model_karyawan->get_profil($nik);
        $this->load->view('page_detil_karyawan', $data);
    }

    public function add()
    {
        $nik = $this->input->post('nik');
        $nama = $this->input->post('nama');
        $tempatLahir = $this->input->post('tempat_lahir');
        $tanggal_lahir = $this->input->post('tanggal_lahir');
        $jenis_kelamin = $this->input->post('jenis_kelamin');
        $nomor_ktp = $this->input->post('no_ktp');
        $alamat = $this->input->post('alamat');
        $telepon = $this->input->post('telepon');
        $data = [
            'nik' => $nik,
            'nama' => $nama,
            'tempat_lahir' => $tempatLahir,
            'tanggal_lahir' => $tanggal_lahir,
            'jenis_kelamin' => $jenis_kelamin,
            'nomor_ktp' => $nomor_ktp,
            'alamat' => $alamat,
            'telepon' => $telepon,
        ];
        $this->model_karyawan->add_karyawan($data);
        $this->session->set_flashdata('message', 'Data Tersimpan');
        redirect('kepegawaian/karyawan', 'refresh');
    }

    public function hapus($nik)
    {
        $this->model_karyawan->delete_karyawan($nik);
        $this->session->set_flashdata('message', 'Data Terhapus');
        redirect('kepegawaian/karyawan', 'refresh');
    }

    public function updateKeluarga()
    {
        $nik = $this->input->post('nik');
        $statusKawin = $this->input->post('status_perkawinan');
        $nama_ismi = $this->input->post('nama_ismi');
        $pekerjaan = $this->input->post('pekerjaan_ismi');
        //upload gambar
        $config['upload_path']   = './assets/kk/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        //cekdata
        if ($this->model_karyawan->get_riwayat_keluarga($nik)) {
            if ($this->upload->do_upload('kk_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'status_perkawinan' => $statusKawin,
                    'nama_ismi' => $nama_ismi,
                    'pekerjaan_ismi' => $pekerjaan,
                    'upload_kk' => $file_upload['file_name'],
                    'last_upload' => date("Y-m-d H:i:s")
                ];
                $this->model_karyawan->update_keluarga($data, $nik);
                $this->session->set_flashdata('message', 'berhasil Di update');
            } else {
                $error = array('error' => $this->upload->display_errors());
                var_dump($error);
            }
        } else {
            if ($this->upload->do_upload('kk_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'nik' => $nik,
                    'status_perkawinan' => $statusKawin,
                    'nama_ismi' => $nama_ismi,
                    'pekerjaan_ismi' => $pekerjaan,
                    'upload_kk' => $file_upload['file_name'],
                    'last_upload' => date("Y-m-d H:i:s")
                ];
                $this->model_karyawan->insert_keluarga($data);
                $this->session->set_flashdata('message', 'berhasil Di Insert');
            } else {
                $error = array('error' => $this->upload->display_errors());
                var_dump($error);
            }
        }
        redirect('kepegawaian/karyawan_detil/' . $nik, 'refresh');
    }
    public function update_kepegawaian()
    {
        $nik = $this->input->post('nik');
        $status_kepegawaian = $this->input->post('status_kepegawaian');
        $status_keaktivan = $this->input->post('status_keaktivan');
        $tmt = $this->input->post('tmt');
        $penempatan = $this->input->post('penempatan');
        $nomor_sk = $this->input->post('nomor_sk');
        $lembaga_pengangkat = $this->input->post('lembaga_pengangkat');
        $sumber_gaji = $this->input->post('sumber_gaji');
        //$last_upload 
        //upload gambar
        $config['upload_path']   = './assets/SK/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        //cekdata
        if ($this->model_karyawan->get_riwayat_pengangkatan($nik)) {
            if ($this->upload->do_upload('sk_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'status_kepegawaian' => $status_kepegawaian,
                    'status_keaktivan' => $status_keaktivan,
                    'tmt' => $tmt,
                    'penempatan' => $penempatan,
                    'nomor_sk' => $nomor_sk,
                    'lembaga_pengangkat' => $lembaga_pengangkat,
                    'sumber_gaji' => $sumber_gaji,
                    'upload_sk' => $file_upload['file_name'],
                    'last_upload' => date("Y-m-d H:i:s")
                ];
                $this->model_karyawan->update_pegawai($data, $nik);
                $this->session->set_flashdata('message', 'berhasil Di update');
            } else {
                $error = array('error' => $this->upload->display_errors());
                var_dump($error);
            }
        } else {
            if ($this->upload->do_upload('sk_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'nik' => $nik,
                    'status_kepegawaian' => $status_kepegawaian,
                    'status_keaktivan' => $status_keaktivan,
                    'tmt' => $tmt,
                    'penempatan' => $penempatan,
                    'nomor_sk' => $nomor_sk,
                    'lembaga_pengangkat' => $lembaga_pengangkat,
                    'sumber_gaji' => $sumber_gaji,
                    'upload_sk' => $file_upload['file_name'],
                    'last_upload' => date("Y-m-d H:i:s")
                ];
                $this->model_karyawan->insert_pegawai($data);
                $this->session->set_flashdata('message', 'berhasil Di Insert');
            } else {
                $error = array('error' => $this->upload->display_errors());
                var_dump($error);
            }
        }
        redirect('kepegawaian/karyawan_detil/' . $nik, 'refresh');
    }
    public function updateKependudukan()
    {
        $nik = $this->input->post('nik');
        $nomor_ktp = $this->input->post('nomor_ktp');
        $telepon = $this->input->post('telepon');
        $agama = $this->input->post('agama');
        $alamat = $this->input->post('alamat');
        //upload gambar
        $config['upload_path']   = './assets/KTP/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        if ($this->upload->do_upload('ktp_upload')) {
            $file_upload = $this->upload->data();
            $data = [
                'nomor_ktp' => $nomor_ktp,
                'telepon' => $telepon,
                'agama' => $agama,
                'alamat' => $alamat,
                'upload_ktp' => $file_upload['file_name'],
            ];
            $this->model_karyawan->update_kependudukan($data, $nik);
            $this->session->set_flashdata(' message ', ' berhasil Di Update');
        } else {
            $error = array('error' => $this->upload->display_errors());
            var_dump($error);
        }
        redirect('kepegawaian/karyawan_detil/' . $nik,  'refresh');
    }

    public function updateProfil()
    {
        $nik = $this->input->post('nik');
        $nik1 = $this->input->post('nik1');
        $nama = $this->input->post('nama');
        $jenis_kelamin = $this->input->post('jenis_kelamin');
        $tempat_lahir = $this->input->post('tempat_lahir');
        $tanggal_lahir = $this->input->post('tanggal_lahir');
        $data = [
            'nik' => $nik1,
            'nama' => $nama,
            'jenis_kelamin' => $jenis_kelamin,
            'tempat_lahir' => $tempat_lahir,
            'tanggal_lahir' => $tanggal_lahir
        ];
        $this->model_karyawan->update_profil($data, $nik);
        $this->session->set_flashdata(' message ', ' berhasil Di Update');
        redirect('kepegawaian/karyawan_detil/' . $nik1,  'refresh');
    }
    public function update_poto_profil()
    {
        $nik = $this->input->post('nik');
        //upload gambar
        $config['upload_path']   = './assets/foto/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        if ($this->upload->do_upload('poto_upload')) {
            $file_upload = $this->upload->data();
            $data = [
                'pp' => $file_upload['file_name'],
            ];
            $this->model_karyawan->update_poto($data, $nik);
            $this->session->set_flashdata(' message ', ' berhasil Di Update');
        } else {
            $error = array('error' => $this->upload->display_errors());
            var_dump($error);
        }
        redirect('kepegawaian/karyawan_detil/' . $nik,  'refresh');
    }
    public function update_pajak()
    {
        $nik = $this->input->post('nik');
        $nomor_npwp = $this->input->post('nomor_npwp');
        //upload gambar
        $config['upload_path']   = './assets/npwp/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        if ($this->model_karyawan->get_pajak($nik)) {
            if ($this->upload->do_upload('npwp_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'nomor_npwp' => $nomor_npwp,
                    'upload_npwp' => $file_upload['file_name']
                ];
                $this->model_karyawan->update_npwp($data, $nik);
                $this->session->set_flashdata(' message ', ' berhasil Di Update');
            } else {
                $error = array('error' => $this->upload->display_errors());
                $this->session->set_flashdata(' message ', $error);
            }
        } else {
            if ($this->upload->do_upload('npwp_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'nik' => $nik,
                    'nomor_npwp' => $nomor_npwp,
                    'upload_npwp' => $file_upload['file_name']
                ];
                $this->model_karyawan->insert_npwp($data);
                $this->session->set_flashdata(' message ', ' berhasil Di insert');
            } else {
                $error = array('error' => $this->upload->display_errors());
                $this->session->set_flashdata(' message ', $error);
            }
        }
        redirect('kepegawaian/karyawan_detil/' . $nik,  'refresh');
    }
    public function update_askes()
    {
        $nik = $this->input->post('nik');
        $no_askes = $this->input->post('no_askes');
        $nama_askes = $this->input->post('nama_askes');
        //upload gambar
        $config['upload_path']   = './assets/askes/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        if ($this->model_karyawan->get_askes($nik)) {
            if ($this->upload->do_upload('npwp_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'no_askes' => $no_askes,
                    'nama_askes' => $nama_askes,
                    'upload_askes' => $file_upload['file_name']
                ];
                $this->model_karyawan->update_askes($data, $nik);
                $this->session->set_flashdata(' message ', ' berhasil Di Update');
            } else {
                $error = array('error' => $this->upload->display_errors());
                $this->session->set_flashdata(' message ', $error);
            }
        } else {
            if ($this->upload->do_upload('npwp_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'nik' => $nik,
                    'no_askes' => $no_askes,
                    'nama_askes' => $nama_askes,
                    'upload_askes' => $file_upload['file_name']
                ];
                $this->model_karyawan->insert_askes($data);
                $this->session->set_flashdata(' message ', ' berhasil Di insert');
            } else {
                $error = array('error' => $this->upload->display_errors());
                $this->session->set_flashdata(' message ', $error);
            }
        }
        redirect('kepegawaian/karyawan_detil/' . $nik,  'refresh');
    }
}
